// Umumiy forma maydoni
export default function Field({ label, type = "text", name, value, onChange, placeholder, help, autoComplete }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-[13px] font-bold text-ink">{label}</label>
            <input
                id={name} name={name} type={type} value={value} onChange={onChange}
                placeholder={placeholder} autoComplete={autoComplete}
                className="w-full px-3.5 py-2.5 border border-line rounded-lg text-ink bg-white outline-none transition-all focus:border-ink focus:shadow-[0_0_0_3px_rgba(23,25,30,.06)] placeholder:text-faint"
            />
            {help && <small className="text-xs leading-[1.4] text-faint">{help}</small>}
        </div>
    );
}
