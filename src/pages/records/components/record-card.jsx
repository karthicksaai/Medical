import React from "react";
import { IconChevronRight, IconFolder } from "@tabler/icons-react";

const RecordCard = ({ record, onNavigate,isPatientRecord }) => {
  return (
    <div className="flex flex-col rounded-xl border bg-[#f9fafc] shadow-sm dark:border-neutral-800 dark:bg-[#8e8e94]">
      <div className="flex justify-between gap-x-3 p-4 md:p-5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white dark:text-blue-200">
          <IconFolder size={70} className="text-green-500" />
        </div>
      </div>

      <a
        onClick={() => onNavigate(isPatientRecord ? record.name : record.recordName)}
        className="inline-flex cursor-pointer items-center justify-between rounded-b-xl border-t border-gray-200 px-4 py-3 text-sm text-gray-600 hover:bg-[#c9c5c5] md:px-5 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        {isPatientRecord ? record.name : record.recordName}
        <IconChevronRight />
      </a>
    </div>
  );
};

export default RecordCard;
