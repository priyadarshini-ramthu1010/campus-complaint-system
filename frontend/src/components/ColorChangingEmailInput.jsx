import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

/**
 * ColorChangingEmailInput Component
 * Dynamically validates Gmail format and changes input border, glow, icon, text tint, 
 * and progress bar color in real-time as each letter is typed into the email field.
 */
const ColorChangingEmailInput = ({
  value = '',
  onChange,
  onBlur,
  name = 'email',
  placeholder = 'Enter your email address',
  error = null,
  registerProps = {},
  required = true,
  disabled = false,
  className = ''
}) => {
  const [typedLength, setTypedLength] = useState(value ? value.length : 0);
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
    setTypedLength((value || '').length);
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    setTypedLength(val.length);
    if (onChange) {
      onChange(e);
    }
    if (registerProps.onChange) {
      registerProps.onChange(e);
    }
  };

  // Determine dynamic visual color state & live validation badge
  const getDynamicColorState = (val) => {
    const len = val.length;
    if (len === 0) {
      return {
        stage: '',
        colorName: 'slate',
        borderColor: 'border-slate-300 dark:border-slate-700',
        focusRing: 'focus:ring-blue-500/20 focus:border-blue-500',
        textColor: 'text-slate-900 dark:text-slate-100 font-semibold',
        iconColor: 'text-slate-400',
        badgeBg: '',
        progressBg: 'bg-slate-200 dark:bg-slate-700',
        percent: 0,
        gradient: 'from-slate-400 to-slate-500',
        shadowGlow: '',
        isValidGmail: false
      };
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const isValidGmail = gmailRegex.test(val);

    if (isValidGmail) {
      return {
        stage: '✔ Valid Gmail Address',
        colorName: 'emerald',
        borderColor: 'border-emerald-500 dark:border-emerald-400',
        focusRing: 'focus:ring-emerald-500/30 focus:border-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-300 font-bold',
        iconColor: 'text-emerald-500 dark:text-emerald-400',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
        progressBg: 'bg-emerald-500',
        percent: 100,
        gradient: 'from-emerald-400 via-teal-500 to-green-600',
        shadowGlow: 'shadow-[0_0_18px_rgba(16,185,129,0.35)]',
        isValidGmail: true
      };
    }

    // Invalid Gmail state
    return {
      stage: '❌ Invalid Gmail Address',
      colorName: 'red',
      borderColor: 'border-red-500 dark:border-red-500',
      focusRing: 'focus:ring-red-500/30 focus:border-red-500',
      textColor: 'text-red-600 dark:text-red-400 font-semibold',
      iconColor: 'text-red-500',
      badgeBg: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800',
      progressBg: 'bg-red-500',
      percent: Math.min(90, (len / 15) * 100),
      gradient: 'from-red-500 to-rose-600',
      shadowGlow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      isValidGmail: false
    };
  };

  const colorState = getDynamicColorState(internalValue);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Header Label + Live Validation Badge */}
      <div className="flex items-center justify-between text-[11px]">
        <label className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          Email Address
        </label>
        {typedLength > 0 && colorState.stage && (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all duration-300 ${colorState.badgeBg}`}>
            {colorState.stage}
          </span>
        )}
      </div>

      {/* Main Input Field */}
      <div className="relative group">
        <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors duration-300 ${colorState.iconColor}`}>
          <Mail className="h-4.5 w-4.5" />
        </span>

        <input
          type="email"
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          value={internalValue}
          {...registerProps}
          onChange={(e) => {
            handleChange(e);
            if (registerProps.onChange) registerProps.onChange(e);
          }}
          onBlur={(e) => {
            if (onBlur) onBlur(e);
            if (registerProps.onBlur) registerProps.onBlur(e);
          }}
          className={`w-full rounded-2xl border-2 bg-slate-50 dark:bg-slate-900/90 pl-11 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 caret-blue-600 dark:caret-white focus:outline-none transition-all duration-300 ${colorState.borderColor} ${colorState.focusRing} ${colorState.shadowGlow}`}
        />

        {/* Right Status Icon */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          {colorState.isValidGmail ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-bounce" />
          ) : typedLength > 0 ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : null}
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      {typedLength > 0 && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden transition-all duration-300 mt-0.5">
          <div
            className={`h-full bg-gradient-to-r ${colorState.gradient} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.max(5, colorState.percent)}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <span className="text-[11px] text-red-500 font-semibold pl-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 inline" />
          {error.message || error}
        </span>
      )}
    </div>
  );
};

export default ColorChangingEmailInput;
