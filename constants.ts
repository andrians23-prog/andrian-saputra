
import { Jenjang, PedagogicalPractice, GraduateDimension, PaperSize, Semester } from './types';

export const JENJANG_OPTIONS = Object.values(Jenjang);
export const SEMESTER_OPTIONS = Object.values(Semester);
export const PAPER_SIZE_OPTIONS = Object.values(PaperSize);
export const PEDAGOGICAL_PRACTICE_OPTIONS = Object.values(PedagogicalPractice);
export const GRADUATE_DIMENSION_OPTIONS = Object.values(GraduateDimension);

export const KELAS_OPTIONS: { [key in Jenjang]: string[] } = {
    [Jenjang.SD]: ["1", "2", "3", "4", "5", "6"],
    [Jenjang.SMP]: ["7", "8", "9"],
    [Jenjang.SMA]: ["10", "11", "12"],
};
