import React from "react";

interface CreateButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "#E2ECE2",
        width: "28px",
        height: "28px",
        borderRadius: "6px",
        padding: 0,
        border: "none",
        position: "absolute",
        top: "-64px",
        left: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 28 28"
        fill="#008000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M15 6C15 5.44772 14.5523 5 14 5C13.4477 5 13 5.44772 13 6V13H6C5.44772 13 5 13.4477 5 14C5 14.5523 5.44772 15 6 15H13V22C13 22.5523 13.4477 23 14 23C14.5523 23 15 22.5523 15 22V15H22C22.5523 15 23 14.5523 23 14C23 13.4477 22.5523 13 22 13H15V6Z" />
      </svg>
    </button>
  );
};

export default CreateButton;
