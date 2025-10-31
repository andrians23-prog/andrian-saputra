import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FormState, initialFormState, GeneratedOutput, RpmData, PedagogicalPractice, PresentationSlide } from './types';
import { generateRpmPrompt } from './services/promptService';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import { readDocx, readPdf } from './services/fileReaderService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
    const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput | null>(null);
    const [loading, setLoading] = useState<{ analysis: boolean; generation: boolean }>({ analysis: false, generation: false });
    const [error, setError] = useState<string | null>(null);
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const handleFormChange = useCallback((field: keyof FormState, value: any) => {
        setFormState(prevState => {
            const newState = { ...prevState, [field]: value };
            if (field === 'jenjang') {
                newState.kelas = '';
            }
            if (field === 'jumlahPertemuan') {
                const count = Number(value) || 0;
                const currentPractices = prevState.praktikPedagogis;
                const newPractices = Array(count).fill(PedagogicalPractice.INQUIRY_DISCOVERY);
                // Preserve existing values if possible
                for (let i = 0; i < Math.min(count, currentPractices.length); i++) {
                    newPractices[i] = currentPractices[i];
                }
                newState.praktikPedagogis = newPractices;
            }
            return newState;
        });
        
        if (invalidFields.size > 0 && invalidFields.has(field as string)) {
            setInvalidFields(prev => {
                const next = new Set(prev);
                next.delete(field as string);
                return next;
            });
        }
    }, [invalidFields]);

    const handleFileAnalysis = useCallback(async () => {
        if (!formState.uploadedFile) {
            setError("Silakan unggah file buku pelajaran terlebih dahulu.");
            return;
        }
        setLoading(prev => ({ ...prev, analysis: true }));
        setError(null);
        try {
            let text = '';
            if (formState.uploadedFile.type === "application/pdf") {
                text = await readPdf(formState.uploadedFile);
            } else if (formState.uploadedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                text = await readDocx(formState.uploadedFile);
            } else {
                throw new Error("Jenis file tidak didukung. Harap unggah .pdf atau .docx");
            }

            const prompt = `Berdasarkan Teks Ekstraksi dari buku pelajaran berikut dan Konteks Materi, buatlah sebuah JSON. Teks Ekstraksi: "${text.substring(0, 8000)}". Konteks Materi: "${formState.konteksMateri}". JSON harus memiliki kunci: "matapelajaran", "materi", "cp" (capaian pembelajaran), dan "tp" (tujuan pembelajaran).`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json" },
            });
            
            const resultJson = JSON.parse(response.text);

            setFormState(prev => ({
                ...prev,
                mataPelajaran: resultJson.matapelajaran || '',
                materiPelajaran: resultJson.materi || '',
                capaianPembelajaran: resultJson.cp || '',
                tujuanPembelajaran: resultJson.tp || ''
            }));
            setAutoFilledFields(new Set(['mataPelajaran', 'materiPelajaran', 'capaianPembelajaran', 'tujuanPembelajaran']));
            
            // Move to step 4 where the autofilled fields are
            setCurrentStep(4);

        } catch (err) {
            console.error("File analysis error:", err);
            setError(`Gagal menganalisis file. ${err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.'}`);
        } finally {
            setLoading(prev => ({ ...prev, analysis: false }));
        }
    }, [formState.uploadedFile, formState.konteksMateri]);

    const handleGenerateRPM = useCallback(async () => {
        setLoading(prev => ({ ...prev, generation: true }));
        setError(null);
        setGeneratedOutput(null);
        try {
            const prompt = generateRpmPrompt(formState);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const resultData: RpmData = JSON.parse(response.text);
            
            setGeneratedOutput({
                rpmHtml: resultData.rpmHtml,
                presentationJson: resultData.presentationJson
            });

        } catch (err) {
            console.error("RPM generation error:", err);
            setError(`Gagal menghasilkan RPM. ${err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.'}`);
        } finally {
            setLoading(prev => ({ ...prev, generation: false }));
        }
    }, [formState]);
    
    const handlePresentationChange = useCallback((newPresentation: PresentationSlide[]) => {
        setGeneratedOutput(prev => {
            if (!prev) return null;
            return { ...prev, presentationJson: newPresentation };
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-brand-dark">
            <header className="bg-brand-primary text-brand-light shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">🚀 Generator RPM Pro</h1>
                    <p className="text-sm text-blue-200">Buat Rencana Pengajaran Profesional dengan Bantuan AI</p>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <InputForm
                        formState={formState}
                        onFormChange={handleFormChange}
                        onFileAnalysis={handleFileAnalysis}
                        onGenerateRPM={handleGenerateRPM}
                        loading={loading}
                        error={error}
                        setError={setError}
                        autoFilledFields={autoFilledFields}
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        totalSteps={totalSteps}
                    />
                    <OutputDisplay
                        output={generatedOutput}
                        isLoading={loading.generation}
                        formData={formState}
                        onPresentationChange={handlePresentationChange}
                    />
                </div>
            </main>
            <footer className="text-center py-6 text-gray-500 text-sm bg-gray-100">
                <p>&copy; {new Date().getFullYear()} Generator RPM Pro. Ditenagai oleh Gemini API.</p>
            </footer>
        </div>
    );
};

export default App;
