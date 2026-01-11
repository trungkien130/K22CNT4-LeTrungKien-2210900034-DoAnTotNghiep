// import { useState } from "react";
// import type { User } from "../types";

export default function SelfEvaluation() {}
// ({ user }: { user: User }) {
//   const [scores, setScores] = useState<Record<number, number>>({});
//   const [evidence, setEvidence] = useState<Record<number, string>>({});

//   const handleSubmit = () => {
//     alert("Đánh giá đã được gửi thành công!");
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//         Tự đánh giá học kỳ
//       </h2>

//       <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
//         <p className="font-medium">
//           Học kỳ: <span className="text-primary">HK1 2024-2025</span>
//         </p>
//         <p className="text-sm text-gray-600">Hạn nộp: 20/01/2025</p>
//       </div>

//       <div className="space-y-8">
//         {mockCriteria.map((cat) => (
//           <div
//             key={cat.id}
//             className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
//           >
//             <h3 className="text-xl font-bold text-primary mb-6">{cat.name}</h3>
//             {cat.items.map((item) => (
//               <div key={item.id} className="mb-6 p-4 bg-gray-50 rounded-xl">
//                 <p className="font-medium mb-3">{item.content}</p>
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <select
//                     className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
//                     value={scores[item.id] || ""}
//                     onChange={(e) =>
//                       setScores({
//                         ...scores,
//                         [item.id]: parseInt(e.target.value) || 0,
//                       })
//                     }
//                   >
//                     <option value="">Chọn điểm</option>
//                     {[0, 2, 4, 6, 8, 10].map((s) => (
//                       <option key={s} value={s}>
//                         {s} điểm
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     type="text"
//                     placeholder="Chứng cứ (link, mô tả...)"
//                     className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
//                     value={evidence[item.id] || ""}
//                     onChange={(e) =>
//                       setEvidence({ ...evidence, [item.id]: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ))}

//         <button
//           onClick={handleSubmit}
//           className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl hover:shadow-xl transition font-bold text-lg"
//         >
//           Gửi đánh giá
//         </button>
//       </div>
//     </div>
//   );
// }
