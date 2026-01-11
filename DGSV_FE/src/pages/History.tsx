// import { mockEvaluationDetails } from "../API/authApi";
// import { Calendar, User, Trophy, Clock, AlertCircle } from "lucide-react";

export default function History() {}
//   const evalItem = mockEvaluationDetails[0];

//   const getStatusConfig = (status: string) => {
//     switch (status) {
//       case "PENDING":
//         return {
//           label: "Chờ duyệt",
//           icon: <Clock className="w-4 h-4" />,
//           bg: "from-yellow-400 to-amber-500",
//           text: "text-white",
//         };
//       case "APPROVED":
//         return {
//           label: "Đã duyệt",
//           icon: <Trophy className="w-4 h-4" />,
//           bg: "from-emerald-500 to-teal-600",
//           text: "text-white",
//         };
//       default:
//         return {
//           label: "Bị từ chối",
//           icon: <AlertCircle className="w-4 h-4" />,
//           bg: "from-red-500 to-rose-600",
//           text: "text-white",
//         };
//     }
//   };

//   const status = getStatusConfig(evalItem.status);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//           Lịch sử đánh giá
//         </h1>

//         <div className="group transform transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1">
//           <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <Calendar className="w-6 h-6" />
//                   <h2 className="text-xl font-bold">{evalItem.semester}</h2>
//                 </div>
//                 <div
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${status.bg} ${status.text} shadow-lg`}
//                 >
//                   {status.icon}
//                   <span className="font-medium">{status.label}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 md:p-8">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//                 <div className="flex items-center gap-4">
//                   <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-3">
//                     <User className="w-8 h-8 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Mã sinh viên</p>
//                     <p className="text-lg font-bold">{evalItem.studentMssv}</p>
//                     <p className="text-lg font-medium">
//                       {evalItem.studentName}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="text-right">
//                   <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                     {evalItem.totalScore}
//                   </p>
//                   <p className="text-gray-600">/100 điểm</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
