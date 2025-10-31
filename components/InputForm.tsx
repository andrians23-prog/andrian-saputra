import React from 'react';
import { FormState, GraduateDimension } from '../types';
import { JENJANG_OPTIONS, KELAS_OPTIONS, SEMESTER_OPTIONS, PEDAGOGICAL_PRACTICE_OPTIONS, GRADUATE_DIMENSION_OPTIONS, PAPER_SIZE_OPTIONS } from '../constants';
import { Spinner, FileUploadIcon, AnalyzeIcon, GenerateIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { FormSection, InputField, TextInput, TextareaInput, SelectInput } from './FormControls';

interface InputFormProps {
    formState: FormState;
    onFormChange: (field: keyof FormState, value: any) => void;
    onFileAnalysis: () => void;
    onGenerateRPM: () => void;
    loading: { analysis: boolean; generation: boolean };
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    autoFilledFields: Set<string>;
    invalidFields: Set<string>;
    setInvalidFields: React.Dispatch<React.SetStateAction<Set<string>>>;
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    totalSteps: number;
}

const stepsValidationConfig: { [key: number]: (keyof FormState)[] } = {
    2: ['namaSatuanPendidikan', 'namaGuru', 'nipGuru', 'namaKepalaSekolah', 'nipKepalaSekolah'],
    3: ['jenjang', 'kelas'],
    4: ['mataPelajaran', 'materiPelajaran', 'capaianPembelajaran', 'tujuanPembelajaran', 'durasiPertemuan', 'dimensiLulusan'],
};

const fieldLabels: Partial<Record<keyof FormState, string>> = {
    namaSatuanPendidikan: "Nama Satuan Pendidikan",
    namaGuru: "Nama Guru",
    nipGuru: "NIP Guru",
    namaKepalaSekolah: "Nama Kepala Sekolah",
    nipKepalaSekolah: "NIP Kepala Sekolah",
    jenjang: "Jenjang Pendidikan",
    kelas: "Kelas",
    mataPelajaran: "Mata Pelajaran",
    materiPelajaran: "Materi Pelajaran",
    capaianPembelajaran: "Capaian Pembelajaran",
    tujuanPembelajaran: "Tujuan Pembelajaran",
    durasiPertemuan: "Durasi Pertemuan",
    dimensiLulusan: "Dimensi Lulusan",
};

const stepTitles = [
    "Input Kontekstual",
    "Data Pokok",
    "Informasi Kelas",
    "Detail Pembelajaran",
    "Opsi Ekspor"
];


const InputForm: React.FC<InputFormProps> = ({
    formState, onFormChange, onFileAnalysis, onGenerateRPM, loading, error, setError, autoFilledFields, invalidFields, setInvalidFields, currentStep, setCurrentStep, totalSteps
}) => {

    const handleMultiSelectChange = (value: GraduateDimension) => {
        const newSelection = formState.dimensiLulusan.includes(value)
            ? formState.dimensiLulusan.filter(item => item !== value)
            : [...formState.dimensiLulusan, value];
        onFormChange('dimensiLulusan', newSelection);
    };

    const validateStep = (step: number): boolean => {
        const fieldsToValidate = stepsValidationConfig[step] || [];
        const missingFields = fieldsToValidate.filter(field => {
            const value = formState[field];
            if (field === 'dimensiLulusan') {
                return Array.isArray(value) && value.length === 0;
            }
            return !value || String(value).trim() === '';
        });

        if (missingFields.length > 0) {
            const missingLabels = missingFields.map(field => fieldLabels[field] || field);
            setError(`Harap isi semua kolom yang wajib diisi di langkah ini: ${missingLabels.join(', ')}.`);
            setInvalidFields(new Set(missingFields));
            return false;
        }
        
        setError(null);
        setInvalidFields(new Set());
        return true;
    };
    
    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFinalValidationAndSubmit = () => {
        const allRequiredFields = Object.values(stepsValidationConfig).flat();
        const missingFields = allRequiredFields.filter(field => {
            const value = formState[field];
            if (field === 'dimensiLulusan') {
                return Array.isArray(value) && value.length === 0;
            }
            return !value || String(value).trim() === '';
        });
        
        if (missingFields.length > 0) {
            const missingLabels = missingFields.map(field => fieldLabels[field] || field);
            setError(`Harap isi semua kolom yang wajib diisi: ${missingLabels.join(', ')}.`);
            setInvalidFields(new Set(missingFields));
            
            const firstMissingField = missingFields[0];
            for (const step in stepsValidationConfig) {
                if (stepsValidationConfig[Number(step)].includes(firstMissingField as any)) {
                    setCurrentStep(Number(step));
                    break;
                }
            }
             window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        setError(null);
        setInvalidFields(new Set());
        onGenerateRPM();
    };

    const StepIndicator = () => (
        <div className="mb-8">
            <h2 className="sr-only">Langkah-langkah</h2>
            <div className="flex items-center justify-between">
                {stepTitles.map((title, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    return (
                        <React.Fragment key={stepNumber}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {isCompleted ? '✓' : stepNumber}
                                </div>
                                <p className={`mt-2 text-xs text-center font-medium ${isCurrent ? 'text-brand-primary' : 'text-gray-500'}`}>{title}</p>
                            </div>
                            {stepNumber < totalSteps && <div className="flex-1 h-1 bg-gray-200 mx-2"></div>}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200/50">
                <StepIndicator />

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert"><strong className="font-bold">Error!</strong><span className="block sm:inline ml-2">{error}</span></div>}

                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <FormSection title="Langkah 1/5: Input Kontekstual" subtitle="Opsional: Unggah buku untuk mengisi otomatis Detail Pembelajaran.">
                        <InputField label="Upload Buku Pelajaran (.pdf, .docx)" id="file-upload">
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brand-accent transition-colors">
                                <div className="space-y-1 text-center">
                                    <FileUploadIcon />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-accent">
                                            <span>Unggah sebuah file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.docx" onChange={(e) => onFormChange('uploadedFile', e.target.files ? e.target.files[0] : null)} />
                                        </label>
                                        <p className="pl-1">atau tarik dan lepas</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{formState.uploadedFile ? formState.uploadedFile.name : 'PDF, DOCX hingga 10MB'}</p>
                                </div>
                            </div>
                        </InputField>
                        <InputField label="Konteks Materi dari Buku" id="konteksMateri">
                            <TextInput id="konteksMateri" placeholder="Contoh: Bab 5 tentang Fotosintesis" value={formState.konteksMateri} onChange={(e) => onFormChange('konteksMateri', e.target.value)} />
                        </InputField>
                        <button
                            onClick={onFileAnalysis}
                            disabled={!formState.uploadedFile || loading.analysis}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading.analysis ? <><Spinner className="text-white -ml-1 mr-3" /> Menganalisis...</> : <><AnalyzeIcon /> Analisis & Isi Otomatis</>}
                        </button>
                    </FormSection>
                </div>

                <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                    <FormSection title="Langkah 2/5: Data Pokok" subtitle="Informasi dasar untuk kop dokumen.">
                        <InputField label="Nama Satuan Pendidikan" id="namaSatuanPendidikan"><TextInput id="namaSatuanPendidikan" value={formState.namaSatuanPendidikan} onChange={e => onFormChange('namaSatuanPendidikan', e.target.value)} isInvalid={invalidFields.has('namaSatuanPendidikan')} /></InputField>
                        <InputField label="Nama Guru" id="namaGuru"><TextInput id="namaGuru" value={formState.namaGuru} onChange={e => onFormChange('namaGuru', e.target.value)} isInvalid={invalidFields.has('namaGuru')} /></InputField>
                        <InputField label="NIP Guru" id="nipGuru"><TextInput id="nipGuru" value={formState.nipGuru} onChange={e => onFormChange('nipGuru', e.target.value)} isInvalid={invalidFields.has('nipGuru')} /></InputField>
                        <InputField label="Nama Kepala Sekolah" id="namaKepalaSekolah"><TextInput id="namaKepalaSekolah" value={formState.namaKepalaSekolah} onChange={e => onFormChange('namaKepalaSekolah', e.target.value)} isInvalid={invalidFields.has('namaKepalaSekolah')} /></InputField>
                        <InputField label="NIP Kepala Sekolah" id="nipKepalaSekolah"><TextInput id="nipKepalaSekolah" value={formState.nipKepalaSekolah} onChange={e => onFormChange('nipKepalaSekolah', e.target.value)} isInvalid={invalidFields.has('nipKepalaSekolah')} /></InputField>
                    </FormSection>
                </div>

                <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                    <FormSection title="Langkah 3/5: Informasi Kelas" subtitle="Pilih jenjang, kelas, dan semester.">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="Jenjang Pendidikan" id="jenjang"><SelectInput id="jenjang" value={formState.jenjang} onChange={e => onFormChange('jenjang', e.target.value)} options={['',...JENJANG_OPTIONS]} isInvalid={invalidFields.has('jenjang')} /></InputField>
                            <InputField label="Kelas" id="kelas"><SelectInput id="kelas" value={formState.kelas} onChange={e => onFormChange('kelas', e.target.value)} options={formState.jenjang ? ['' ,...KELAS_OPTIONS[formState.jenjang]] : []} disabled={!formState.jenjang} isInvalid={invalidFields.has('kelas')} /></InputField>
                            <InputField label="Semester" id="semester"><SelectInput id="semester" value={formState.semester} onChange={e => onFormChange('semester', e.target.value)} options={SEMESTER_OPTIONS} /></InputField>
                        </div>
                    </FormSection>
                </div>

                <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
                    <FormSection title="Langkah 4/5: Detail Pembelajaran" subtitle="Inti dari rencana pembelajaran Anda.">
                        <InputField label="Mata Pelajaran" id="mataPelajaran"><TextInput id="mataPelajaran" value={formState.mataPelajaran} onChange={e => onFormChange('mataPelajaran', e.target.value)} disabled={autoFilledFields.has('mataPelajaran')} isInvalid={invalidFields.has('mataPelajaran')} /></InputField>
                        <InputField label="Materi Pelajaran" id="materiPelajaran"><TextareaInput id="materiPelajaran" value={formState.materiPelajaran} onChange={e => onFormChange('materiPelajaran', e.target.value)} disabled={autoFilledFields.has('materiPelajaran')} isInvalid={invalidFields.has('materiPelajaran')} /></InputField>
                        <InputField label="Capaian Pembelajaran (CP)" id="capaianPembelajaran"><TextareaInput id="capaianPembelajaran" value={formState.capaianPembelajaran} onChange={e => onFormChange('capaianPembelajaran', e.target.value)} disabled={autoFilledFields.has('capaianPembelajaran')} isInvalid={invalidFields.has('capaianPembelajaran')} /></InputField>
                        <InputField label="Tujuan Pembelajaran" id="tujuanPembelajaran"><TextareaInput id="tujuanPembelajaran" value={formState.tujuanPembelajaran} onChange={e => onFormChange('tujuanPembelajaran', e.target.value)} disabled={autoFilledFields.has('tujuanPembelajaran')} isInvalid={invalidFields.has('tujuanPembelajaran')} /></InputField>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Jumlah Pertemuan" id="jumlahPertemuan"><TextInput id="jumlahPertemuan" type="number" min="1" value={formState.jumlahPertemuan} onChange={e => onFormChange('jumlahPertemuan', e.target.value)} /></InputField>
                            <InputField label="Durasi Setiap Pertemuan" id="durasiPertemuan"><TextInput id="durasiPertemuan" placeholder="Contoh: 2 x 35 menit" value={formState.durasiPertemuan} onChange={e => onFormChange('durasiPertemuan', e.target.value)} isInvalid={invalidFields.has('durasiPertemuan')} /></InputField>
                        </div>
                        {Array.from({ length: formState.jumlahPertemuan }, (_, i) => (
                            <InputField key={i} label={`Praktik Pedagogis Pertemuan ${i + 1}`} id={`praktik-${i}`}>
                                <SelectInput
                                id={`praktik-${i}`}
                                value={formState.praktikPedagogis[i] || ''}
                                onChange={e => {
                                    const newPraktik = [...formState.praktikPedagogis];
                                    newPraktik[i] = e.target.value as any;
                                    onFormChange('praktikPedagogis', newPraktik);
                                }}
                                options={PEDAGOGICAL_PRACTICE_OPTIONS}
                                />
                            </InputField>
                        ))}
                        <InputField label="Dimensi Lulusan" id="dimensiLulusan">
                            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 p-3 rounded-md border transition-colors ${invalidFields.has('dimensiLulusan') ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                {GRADUATE_DIMENSION_OPTIONS.map(dim => (
                                    <label key={dim} className="flex items-center space-x-2 text-sm font-normal cursor-pointer">
                                        <input type="checkbox" checked={formState.dimensiLulusan.includes(dim)} onChange={() => handleMultiSelectChange(dim)} className="rounded border-gray-300 text-brand-primary shadow-sm focus:border-brand-primary focus:ring focus:ring-offset-0 focus:ring-brand-accent focus:ring-opacity-50" />
                                        <span>{dim}</span>
                                    </label>
                                ))}
                            </div>
                        </InputField>
                    </FormSection>
                </div>
                
                <div style={{ display: currentStep === 5 ? 'block' : 'none' }}>
                    <FormSection title="Langkah 5/5: Opsi Ekspor" subtitle="Pengaturan untuk file output Anda.">
                        <InputField label="Ukuran Kertas PDF" id="paperSize">
                        <SelectInput id="paperSize" value={formState.paperSize} onChange={e => onFormChange('paperSize', e.target.value)} options={PAPER_SIZE_OPTIONS} />
                        </InputField>
                    </FormSection>
                </div>

                 <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 1 || loading.analysis || loading.generation}
                        className="flex items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeftIcon />
                        Kembali
                    </button>
                    
                    {currentStep < totalSteps && (
                        <button
                            onClick={handleNext}
                            disabled={loading.analysis || loading.generation}
                            className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Lanjut
                            <ChevronRightIcon />
                        </button>
                    )}

                    {currentStep === totalSteps && (
                        <button
                            onClick={handleFinalValidationAndSubmit}
                            disabled={loading.generation || loading.analysis}
                            className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-lg text-lg font-semibold text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform duration-150 ease-in-out hover:scale-105"
                        >
                            {loading.generation ? <><Spinner className="text-white -ml-1 mr-3" /> Menghasilkan RPM...</> : <><GenerateIcon /> Buat RPM Sekarang!</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InputForm;