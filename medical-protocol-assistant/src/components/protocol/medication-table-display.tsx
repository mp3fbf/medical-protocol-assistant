/**
 * Component to display a list of medications in a table format.
 * This is a read-only display component.
 */
import React from "react";
import type { FlowchartMedication } from "@/types/flowchart"; // Using FlowchartMedication for now

interface MedicationTableDisplayProps {
  medications: FlowchartMedication[];
  title?: string;
}

export const MedicationTableDisplay: React.FC<MedicationTableDisplayProps> = ({
  medications,
  title = "Medicamentos",
}) => {
  if (!medications || medications.length === 0) {
    return (
      <div className="my-4 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          Nenhum medicamento especificado.
        </p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                Medicamento
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                Dose
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                Via
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                Frequência
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                Duração
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                Observações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {medications.map((med, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-900"}
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {med.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {med.dose}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {med.route}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {med.frequency}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {med.duration || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {med.notes || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
