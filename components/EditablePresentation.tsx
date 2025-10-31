import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PresentationSlide } from '../types';
import { InputField, TextInput, TextareaInput } from './FormControls';
import { GoogleGenAI } from '@google/genai';
import { Spinner, SparklesIcon } from './Icons';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface EditablePresentationProps {
    slides: PresentationSlide[];
    onChange: (slides: PresentationSlide[]) => void;
}

const validateImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!url || !url.startsWith('http')) {
            return resolve(false);
        }
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

const EditablePresentation: React.FC<EditablePresentationProps> = ({ slides, onChange }) => {
    
    const [imageLoading, setImageLoading] = useState<{ [index: number]: boolean }>({});
    const debounceTimeout = useRef<{ [index: number]: ReturnType<typeof setTimeout> }>({});
    const slidesRef = useRef(slides);

    useEffect(() => {
        slidesRef.current = slides;
    }, [slides]);

    const fetchImageSuggestion = useCallback(async (index: number, description: string) => {
        if (!description || description.trim().length < 5) {
            setImageLoading(prev => ({ ...prev, [index]: false }));
            return;
        }

        setImageLoading(prev => ({ ...prev, [index]: true }));

        try {
            const prompt = `Carikan satu URL gambar hotlink langsung dari Pexels atau Unsplash yang paling cocok dengan deskripsi ini: "${description}". Pastikan gambar bebas digunakan. Hanya kembalikan URL-nya saja, tanpa teks tambahan. URL harus valid dan bisa langsung digunakan di tag <img>.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const imageUrl = response.text.trim();
            
            const isValid = await validateImageUrl(imageUrl);
            
            if (isValid) {
                const latestSlides = slidesRef.current;
                const newSlides = [...latestSlides];
                newSlides[index] = { ...newSlides[index], imageUrl };
                onChange(newSlides);
            } else {
                console.warn(`URL yang disarankan AI bukan gambar yang valid: ${imageUrl}`);
                const latestSlides = slidesRef.current;
                // Jika sudah ada gambar sebelumnya, hapus karena saran baru tidak valid
                if (latestSlides[index]?.imageUrl) {
                    const newSlides = [...latestSlides];
                    newSlides[index] = { ...newSlides[index], imageUrl: undefined };
                    onChange(newSlides);
                }
            }
        } catch (error) {
            console.error("Gagal mendapatkan saran gambar:", error);
        } finally {
            setImageLoading(prev => ({ ...prev, [index]: false }));
        }
    }, [onChange]);

    const fetchImageWithDebounce = useCallback((index: number, description: string) => {
        if (debounceTimeout.current[index]) {
            clearTimeout(debounceTimeout.current[index]);
        }
        debounceTimeout.current[index] = setTimeout(() => {
            fetchImageSuggestion(index, description);
        }, 1200); // 1.2 second debounce
    }, [fetchImageSuggestion]);
    
    const handleSlideChange = (index: number, field: keyof PresentationSlide, value: string | string[]) => {
        const newSlides = slides.map((slide, i) => {
            if (i === index) {
                const updatedSlide = { ...slide };
                 if (field === 'points') {
                    updatedSlide[field] = (value as string).split('\n');
                } else {
                    // This handles title, imageSuggestion
                    (updatedSlide as any)[field] = value;
                }

                // If the text suggestion changes, also clear the existing image URL
                if (field === 'imageSuggestion') {
                    updatedSlide.imageUrl = undefined;
                }
                return updatedSlide;
            }
            return slide;
        });
        onChange(newSlides);

        if (field === 'imageSuggestion') {
            fetchImageWithDebounce(index, value as string);
        }
    };
    
    const handleManualFetch = (index: number) => {
        if (debounceTimeout.current[index]) {
            clearTimeout(debounceTimeout.current[index]);
        }
        const description = slides[index]?.imageSuggestion || '';
        if (description.trim()) {
            fetchImageSuggestion(index, description);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                Sesuaikan draf presentasi di bawah ini sebelum mengunduhnya. Perubahan disimpan secara otomatis.
            </p>
            {slides.map((slide, index) => (
                <div key={index} className="p-4 border border-gray-300 rounded-lg bg-gray-50/50 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4">Slide {index + 1}</h4>
                    <div className="space-y-4">
                        <InputField label="Judul Slide" id={`slide-title-${index}`}>
                           <TextInput 
                                id={`slide-title-${index}`}
                                value={slide.title}
                                onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                           />
                        </InputField>
                        <InputField 
                            label="Poin-Poin Utama" 
                            id={`slide-points-${index}`}
                            description="Satu poin per baris."
                        >
                           <TextareaInput 
                                id={`slide-points-${index}`}
                                value={slide.points.join('\n')}
                                onChange={(e) => handleSlideChange(index, 'points', e.target.value)}
                                rows={5}
                           />
                        </InputField>
                        <InputField 
                            label="Saran Gambar (Opsional)" 
                            id={`slide-image-${index}`}
                            description="Deskripsikan gambar yang relevan, AI akan mencarikan untuk Anda."
                        >
                            <div className="flex items-center gap-2">
                               <div className="relative flex-grow">
                                   <TextInput 
                                        id={`slide-image-${index}`}
                                        value={slide.imageSuggestion || ''}
                                        onChange={(e) => handleSlideChange(index, 'imageSuggestion', e.target.value)}
                                        placeholder="Contoh: seekor kucing oranye tidur di bawah matahari"
                                   />
                               </div>
                               <button
                                   type="button"
                                   onClick={() => handleManualFetch(index)}
                                   disabled={imageLoading[index] || !slide.imageSuggestion?.trim()}
                                   className="flex-shrink-0 flex items-center justify-center px-3 py-2 border border-brand-primary text-brand-primary rounded-md shadow-sm text-sm font-medium hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
                                   aria-label="Generate image suggestion"
                               >
                                   {imageLoading[index] ? (
                                       <Spinner size="sm" className="text-brand-primary" />
                                   ) : (
                                       <SparklesIcon className="w-5 h-5" />
                                   )}
                                   <span className="ml-2 hidden sm:inline">Generate</span>
                               </button>
                           </div>
                        </InputField>
                        {slide.imageUrl && !imageLoading[index] && (
                            <div className="mt-2 p-2 border rounded-md bg-white">
                                <p className="text-xs font-medium text-gray-600 mb-2">Pratinjau Gambar:</p>
                                <img src={slide.imageUrl} alt={slide.imageSuggestion || 'Gambar yang disarankan AI'} className="rounded-md max-w-full h-auto max-h-48 object-contain mx-auto" />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EditablePresentation;