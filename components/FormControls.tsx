import React from 'react';

export const FormSection: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-brand-dark tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 font-light">{subtitle}</p>
        <div className="space-y-5">{children}</div>
    </div>
);

export const InputField: React.FC<{ label: string; id: string; children: React.ReactNode; description?: string; }> = ({ label, id, children, description }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        {children}
        {description && <p className="mt-1.5 text-xs text-gray-500">{description}</p>}
    </div>
);

const inputBaseClasses = "w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";
const invalidInputClasses = "border-red-500 ring-1 ring-red-500 bg-red-50";
const validInputClasses = "border-gray-300";

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { id: string; isInvalid?: boolean }> = ({ isInvalid, ...props }) => (
    <input
        type="text"
        {...props}
        className={`${inputBaseClasses} ${isInvalid ? invalidInputClasses : validInputClasses}`}
    />
);

export const TextareaInput: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; isInvalid?: boolean }> = ({ isInvalid, ...props }) => (
    <textarea
        {...props}
        rows={4}
        className={`${inputBaseClasses} ${isInvalid ? invalidInputClasses : validInputClasses}`}
    />
);

export const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { id: string; options: (string|number)[]; isInvalid?: boolean }> = ({ options, isInvalid, ...props }) => (
    <select
        {...props}
        className={`${inputBaseClasses} ${isInvalid ? invalidInputClasses : validInputClasses}`}
    >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);
