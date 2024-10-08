import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sun } from "../assets";
import { navlinks } from "../constants";
import { IconReportMedical } from "@tabler/icons-react";

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`relative h-[48px] w-[48px] rounded-[10px] ${
      isActive && isActive === name && "bg-[#43ad96]"
    } flex items-center justify-center ${
      !disabled && "cursor-pointer"
    } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
      <img src={imgUrl} alt="fund_logo" className="h-6 w-6" />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`h-6 w-6 ${isActive !== name && "grayscale"}`}
      />
    )}

    {/* Tooltip for navlink name on hover */}
    <span className="absolute left-[60px] z-10 hidden min-w-max rounded-[10px] bg-gray-800 px-2 py-1 text-sm text-white group-hover:flex">
      {name}
    </span>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState("dashboard");

  return (
    <div className="sticky top-5 flex h-[93vh] flex-col items-center justify-between">
      <Link to="/">
        <div className="rounded-[10px] bg-[#007A7C] p-2">
          <IconReportMedical stroke={2} size={40} color="#ffffff" className=" " />
        </div>
      </Link>

      <div className="mt-12 flex w-[76px] flex-1 flex-col items-center justify-between rounded-[20px] bg-[#005B73] py-4">
        <div className="flex flex-col items-center justify-center gap-3">
          {navlinks.map((link) => (
            <div className="group relative" key={link.name}>
              <Icon
                {...link}
                isActive={isActive}
                handleClick={() => {
                  if (!link.disabled) {
                    setIsActive(link.name);
                    navigate(link.link);
                  }
                }}
              />
            </div>
          ))}
        </div>

        <Icon styles="bg-[#43ad96] shadow-secondary" imgUrl={sun} />
      </div>
    </div>
  );
};

export default Sidebar;
