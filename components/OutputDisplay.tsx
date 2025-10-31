import React, { useRef, useState, useEffect } from 'react';
import { GeneratedOutput, FormState, PaperSize, PresentationSlide } from '../types';
import { Spinner, CopyIcon, DownloadPdfIcon, DownloadPptxIcon, DocumentIcon, PresentationIcon, DownloadWorksheetIcon, SearchIcon, CloseIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
import EditablePresentation from './EditablePresentation';

// Declare PptxGenJS for use from CDN
declare var PptxGenJS: any;

interface OutputDisplayProps {
    output: GeneratedOutput | null;
    isLoading: boolean;
    formData: FormState;
    onPresentationChange: (slides: PresentationSlide[]) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 py-3 px-4 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent/50 ${
            active 
            ? 'border-brand-primary text-brand-primary bg-white' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {children}
    </button>
);

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-accent">
        {children}
    </button>
);


const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading, formData, onPresentationChange }) => {
    const outputRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'rpm' | 'presentation'>('rpm');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMatches, setSearchMatches] = useState<string[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
    const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

    // Reset tab and search to default when new output is generated
    useEffect(() => {
        if (output) {
            setActiveTab('rpm');
            setSearchQuery('');
        }
    }, [output]);
    
    // Effect to perform search and update highlighted HTML
    useEffect(() => {
        if (!searchQuery.trim() || !output?.rpmHtml) {
            setHighlightedHtml(output?.rpmHtml || null);
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const originalHtml = output.rpmHtml;
        const matches: string[] = [];
        let matchIndex = 0;
        
        const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'gi');
        
        const newHtml = originalHtml.replace(regex, (match) => {
            const id = `search-match-${matchIndex++}`;
            matches.push(id);
            return `<mark id="${id}">${match}</mark>`;
        });

        setHighlightedHtml(newHtml);
        setSearchMatches(matches);
        setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
    }, [searchQuery, output?.rpmHtml]);

    // Effect to scroll to the current match
    useEffect(() => {
        document.querySelectorAll('mark.active-match').forEach(el => el.classList.remove('active-match'));

        if (currentMatchIndex >= 0 && searchMatches.length > 0) {
            const currentId = searchMatches[currentMatchIndex];
            const element = document.getElementById(currentId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('active-match');
            }
        }
    }, [currentMatchIndex, searchMatches]);

    const handleNextMatch = () => {
        if (searchMatches.length === 0) return;
        setCurrentMatchIndex(prev => (prev + 1) % searchMatches.length);
    };

    const handlePrevMatch = () => {
        if (searchMatches.length === 0) return;
        setCurrentMatchIndex(prev => (prev - 1 + searchMatches.length) % searchMatches.length);
    };

    const handleCopyToGoogleDocs = () => {
        if (outputRef.current) {
            const htmlContent = output?.rpmHtml || outputRef.current.innerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });
            navigator.clipboard.write([clipboardItem]).then(() => {
                window.open('https://docs.new', '_blank');
                alert('Konten telah disalin! Buka tab Google Dokumen yang baru dan tempel (Ctrl+V) untuk melihat hasilnya.');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Gagal menyalin konten secara otomatis. Anda bisa mencoba menyalin manual dari tampilan.');
            });
        }
    };

    const getPdfOptions = (filename: string) => {
        const f4Format = [8.27, 13];
        const paperFormat = formData.paperSize === PaperSize.F4 ? f4Format : formData.paperSize.toLowerCase();
        
        return {
            margin:       0.787,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: paperFormat, orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };
    };

    const handleDownloadPdf = () => {
        if (output?.rpmHtml) {
            const htmlString = output.rpmHtml;
            const filename = `RPM_${formData.mataPelajaran.replace(/\s/g, '_')}.pdf`;
            const opt = getPdfOptions(filename);
            // Generate the PDF from the complete HTML string for better reliability, avoiding blank pages.
            (window as any).html2pdf().set(opt).from(htmlString).save();
        } else {
            alert('Gagal menemukan konten RPM untuk diunduh.');
        }
    };
    
    const handleDownloadLkpd = () => {
        if (outputRef.current && output?.rpmHtml) {
            const lkpdElement = outputRef.current.querySelector('#lkpd-section');
            if (lkpdElement) {
                // Extract the style block from the full HTML string for consistent styling
                const styleMatch = output.rpmHtml.match(/<style>([\s\S]*?)<\/style>/);
                const styles = styleMatch ? styleMatch[0] : ''; // Get the full <style>...</style> tag

                // Get the inner HTML of the LKPD section
                const lkpdHtmlContent = lkpdElement.innerHTML;
                
                // Construct a new, self-contained HTML document for the PDF to ensure styles are applied
                const fullLkpdHtml = `
                    <!DOCTYPE html>
                    <html lang="id">
                    <head>
                        <meta charset="UTF-8">
                        <title>Lembar Kerja Peserta Didik (LKPD)</title>
                        ${styles}
                    </head>
                    <body>
                        <div class="container">
                            ${lkpdHtmlContent}
                        </div>
                    </body>
                    </html>
                `;

                const filename = `LKPD_${formData.mataPelajaran.replace(/\s/g, '_')}.pdf`;
                const opt = getPdfOptions(filename);
                // Generate the PDF from the newly constructed HTML string for reliability
                (window as any).html2pdf().set(opt).from(fullLkpdHtml).save();
            } else {
                alert('Gagal menemukan bagian LKPD untuk diunduh.');
            }
        }
    };

    const handleDownloadPptx = () => {
        if (output?.presentationJson) {
            const pptx = new PptxGenJS();
            output.presentationJson.forEach(slideData => {
                const slide = pptx.addSlide();
                slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 1, fontSize: 24, bold: true, color: '0052CC' });
                
                const points = slideData.points.filter(p => p.trim() !== '').map(p => ({ text: p }));
                if (points.length > 0) {
                    slide.addText(points, { x: 0.5, y: 1.5, w: '90%', h: 3.5, fontSize: 16, bullet: true, color: '172B4D' });
                }

                if (slideData.imageSuggestion) {
                    slide.addNotes(`Saran Gambar: ${slideData.imageSuggestion}`);
                }
            });

            pptx.writeFile({ fileName: `Presentasi_${formData.mataPelajaran.replace(/\s/g, '_')}.pptx` });
        }
    };

    return (
        <div className="sticky top-24">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200/50">
                <h3 className="text-xl font-bold text-brand-primary mb-4 tracking-tight">Hasil Generated</h3>
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-md">
                        <Spinner size="lg" className="text-brand-primary" />
                        <p className="mt-4 text-lg font-medium text-gray-600 animate-pulse">AI sedang meracik Rencana Pengajaran Anda...</p>
                        <p className="text-sm text-gray-500">Ini mungkin memakan waktu sejenak.</p>
                    </div>
                )}

                {!isLoading && !output && (
                    <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg p-4 text-center border-2 border-dashed border-gray-200">
                        <DocumentIcon className="mx-auto h-20 w-20 text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Menunggu Input Anda</h3>
                        <p className="mt-1 text-sm text-gray-500">Selesaikan langkah-langkah di sebelah kiri untuk membuat RPM Anda.</p>
                    </div>
                )}
                
                {output && (
                    <>
                        <div className="relative mb-4">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari di dalam dokumen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-md border-gray-300 pl-10 pr-40 py-2 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                            />
                            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5 items-center">
                                {searchQuery && (
                                    <>
                                        <span className="inline-flex items-center px-2 text-sm text-gray-500 whitespace-nowrap">
                                            {searchMatches.length > 0 ? `${currentMatchIndex + 1} / ${searchMatches.length}` : '0 hasil'}
                                        </span>
                                        <button onClick={handlePrevMatch} disabled={searchMatches.length === 0} className="inline-flex items-center rounded border border-gray-200 p-1 font-sans text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">
                                            <ChevronUpIcon />
                                        </button>
                                        <button onClick={handleNextMatch} disabled={searchMatches.length === 0} className="ml-1 inline-flex items-center rounded border border-gray-200 p-1 font-sans text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">
                                            <ChevronDownIcon />
                                        </button>
                                        <button onClick={() => setSearchQuery('')} className="ml-1 inline-flex items-center rounded border border-transparent p-1 font-sans text-sm font-medium text-gray-600 hover:bg-gray-100">
                                            <CloseIcon />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
                            <ActionButton onClick={handleCopyToGoogleDocs}><CopyIcon /> Salin ke GDocs</ActionButton>
                            <ActionButton onClick={handleDownloadPdf}><DownloadPdfIcon /> Unduh PDF</ActionButton>
                            <ActionButton onClick={handleDownloadLkpd}><DownloadWorksheetIcon /> Unduh LKPD</ActionButton>
                            <ActionButton onClick={handleDownloadPptx}><DownloadPptxIcon /> Unduh PPTX</ActionButton>
                        </div>
                        
                        <div className="border-b border-gray-200">
                             <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                                <TabButton active={activeTab === 'rpm'} onClick={() => setActiveTab('rpm')}>
                                   <DocumentIcon />
                                   Dokumen RPM
                                </TabButton>
                                <TabButton active={activeTab === 'presentation'} onClick={() => setActiveTab('presentation')}>
                                   <PresentationIcon />
                                   Draf Presentasi
                                </TabButton>
                             </nav>
                        </div>
                        
                        <div className="mt-4 max-h-[60vh] overflow-y-auto p-1 bg-gray-50/70 rounded-b-lg">
                           {activeTab === 'rpm' && (
                             <div className="border border-gray-200 bg-white p-4 rounded-md shadow-inner">
                                 <div
                                     ref={outputRef}
                                     dangerouslySetInnerHTML={{ __html: highlightedHtml || '' }}
                                 />
                             </div>
                           )}
                           {activeTab === 'presentation' && (
                             <EditablePresentation 
                                slides={output.presentationJson}
                                onChange={onPresentationChange}
                             />
                           )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OutputDisplay;