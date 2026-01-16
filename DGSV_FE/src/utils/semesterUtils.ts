import { type Semester } from "../types";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import React from "react";

export interface StatusInfo {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    urgent?: boolean;
}

/**
 * Calculates the status information for a semester based on its active state and dates.
 * @param sem The semester object.
 * @returns StatusInfo object containing styling and label.
 */
export const getSemesterStatusInfo = (sem: Semester): StatusInfo => {
    if (!sem.isActive) {
        return {
            label: "Đã đóng",
            color: "text-gray-500",
            bg: "bg-gray-100",
            border: "border-gray-200",
            icon: React.createElement(CheckCircle, { size: 16 }),
        };
    }

    const today = new Date();
    const endDate = sem.dateEndStudent ? new Date(sem.dateEndStudent) : null;

    if (endDate) {
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7 && diffDays >= 0) {
            return {
                label: `Sắp hết hạn (${diffDays} ngày)`,
                color: "text-red-600",
                bg: "bg-red-50",
                border: "border-red-200",
                icon: React.createElement(AlertCircle, { size: 16 }),
                urgent: true,
            };
        }
    }

    return {
        label: "Đang diễn ra",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        icon: React.createElement(Calendar, { size: 16 }),
    };
};
