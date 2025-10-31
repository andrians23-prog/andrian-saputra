export enum Jenjang {
    SD = "SD",
    SMP = "SMP",
    SMA = "SMA"
}

export enum Semester {
    SATU = "1",
    DUA = "2"
}

export enum PaperSize {
    A4 = "A4",
    F4 = "F4/Folio",
    LETTER = "Letter"
}

export enum PedagogicalPractice {
    INQUIRY_DISCOVERY = "Inkuiri-Discovery",
    PJBL = "PjBL (Project-Based Learning)",
    PROBLEM_SOLVING = "Problem Solving",
    GAME_BASED = "Game Based Learning",
    STATION_LEARNING = "Station Learning"
}

export enum GraduateDimension {
    FAITH_PIETY = "Keimanan & Ketakwaan",
    CITIZENSHIP = "Kewargaan",
    CRITICAL_REASONING = "Penalaran Kritis",
    CREATIVITY = "Kreativitas",
    COLLABORATION = "Kolaborasi",
    INDEPENDENCE = "Kemandirian",
    HEALTH = "Kesehatan",
    COMMUNICATION = "Komunikasi"
}

export interface FormState {
    // A
    uploadedFile: File | null;
    konteksMateri: string;
    // B
    namaSatuanPendidikan: string;
    namaGuru: string;
    nipGuru: string;
    namaKepalaSekolah: string;
    nipKepalaSekolah: string;
    // C
    jenjang: Jenjang | '';
    kelas: string;
    semester: Semester;
    // D
    mataPelajaran: string;
    materiPelajaran: string;
    capaianPembelajaran: string;
    tujuanPembelajaran: string;
    jumlahPertemuan: number;
    durasiPertemuan: string;
    praktikPedagogis: PedagogicalPractice[];
    dimensiLulusan: GraduateDimension[];
    // E
    paperSize: PaperSize;
}

export const initialFormState: FormState = {
    uploadedFile: null,
    konteksMateri: '',
    namaSatuanPendidikan: '',
    namaGuru: '',
    nipGuru: '',
    namaKepalaSekolah: '',
    nipKepalaSekolah: '',
    jenjang: '',
    kelas: '',
    semester: Semester.SATU,
    mataPelajaran: '',
    materiPelajaran: '',
    capaianPembelajaran: '',
    tujuanPembelajaran: '',
    jumlahPertemuan: 1,
    durasiPertemuan: '2 x 45 menit',
    praktikPedagogis: [PedagogicalPractice.INQUIRY_DISCOVERY],
    dimensiLulusan: [],
    paperSize: PaperSize.A4,
};

export interface PresentationSlide {
    title: string;
    points: string[];
    imageSuggestion?: string;
    imageUrl?: string;
}

export interface GeneratedOutput {
    rpmHtml: string;
    presentationJson: PresentationSlide[];
}

export interface RpmData {
    rpmHtml: string;
    presentationJson: PresentationSlide[];
}