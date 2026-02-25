'use client';

import { motion } from 'framer-motion';

interface ResultTableProps {
  data: Record<string, string | number>[];
}

export default function ResultTable({ data }: ResultTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6 text-center text-sm text-zinc-400">
        No results to display. Run a query or reveal a solution.
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto rounded-lg border border-zinc-700"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700 bg-zinc-800">
            {columns.map((col) => (
              <th key={col} className="px-4 py-2.5 text-left font-medium text-brand-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-zinc-700/50 last:border-0"
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-zinc-200">
                  {String(row[col])}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      <div className="bg-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
        {data.length} row{data.length !== 1 ? 's' : ''} returned
      </div>
    </motion.div>
  );
}
