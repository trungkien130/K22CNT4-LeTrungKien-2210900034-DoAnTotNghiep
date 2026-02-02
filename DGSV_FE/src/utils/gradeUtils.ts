export interface GradeInfo {
  letter: string;
  classification: string;
  color: string;
  textColor: string;
}

export const getGradeInfo = (score: number): GradeInfo => {
  if (score >= 90) {
    return { letter: "A+", classification: "Xuất sắc", color: "bg-green-100", textColor: "text-green-700" };
  } else if (score >= 85) {
    return { letter: "A", classification: "Giỏi", color: "bg-green-50", textColor: "text-green-600" };
  } else if (score >= 80) {
    return { letter: "B+", classification: "Khá giỏi", color: "bg-blue-100", textColor: "text-blue-700" };
  } else if (score >= 70) {
    return { letter: "B", classification: "Khá", color: "bg-blue-50", textColor: "text-blue-600" };
  } else if (score >= 65) {
    return { letter: "C+", classification: "Trung bình khá", color: "bg-yellow-100", textColor: "text-yellow-700" };
  } else if (score >= 55) {
    return { letter: "C", classification: "Trung bình", color: "bg-yellow-50", textColor: "text-yellow-600" };
  } else if (score >= 50) {
    return { letter: "D+", classification: "Trung bình yếu", color: "bg-orange-100", textColor: "text-orange-700" };
  } else if (score >= 40) {
    return { letter: "D", classification: "Yếu", color: "bg-orange-50", textColor: "text-orange-600" };
  } else {
    return { letter: "F", classification: "Kém (Trượt)", color: "bg-red-100", textColor: "text-red-700" };
  }
};
