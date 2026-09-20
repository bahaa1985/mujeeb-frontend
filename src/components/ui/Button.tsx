import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  // fullWidth = false,
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'py-2 mx-auto  rounded font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const widthStyle = 'w-full sm:w-3/4 md:w-1/2 lg:w-1/3 mx-auto grid-start-2 grid-end-2'; // Adjusted width for responsiveness

  const {t} = useLanguage();

  return (
    <div className="w-full flex justify-center mx-auto">
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${widthStyle}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? t("auth.loging") : children}
      </button>
    </div>
  );
};
