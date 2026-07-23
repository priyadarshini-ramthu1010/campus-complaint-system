import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

/**
 * ColorChangingEmailInput Component
 * Dynamically changes input border, glow, icon, text tint, and progress bar 
 * color in real-time as each letter/character is typed into the email field.
 */
const ColorChangingEmailInput = ({
  value = '',
  onChange,
  onBlur,
  name = 'email',
  placeholder = 'your-email@campus.com',
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

  // Determine dynamic visual color state based on typed letters & email validity
  const getDynamicColorState = (val) => {
    const len = val.length;
    if (len === 0) {
      return {
        stage: 'Empty',
        colorName: 'slate',
        borderColor: 'border-slate-300 dark:border-slate-700',
        focusRing: 'focus:ring-slate-400/20 focus:border-slate-400',
        textColor: 'text-slate-700 dark:text-slate-200',
        iconColor: 'text-slate-400',
        badgeBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        progressBg: 'bg-slate-200 dark:bg-slate-700',
        percent: 0,
        gradient: 'from-slate-400 to-slate-500',
        shadowGlow: ''
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(val);
    const hasAt = val.includes('@');

    if (error) {
      return {
        stage: 'Invalid Error',
        colorName: 'red',
        borderColor: 'border-red-500 dark:border-red-500',
        focusRing: 'focus:ring-red-500/30 focus:border-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        iconColor: 'text-red-500',
        badgeBg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        progressBg: 'bg-red-500',
        percent: Math.min(100, (len / 15) * 100),
        gradient: 'from-red-500 to-rose-600',
        shadowGlow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      };
    }

    if (isValid) {
      return {
        stage: 'Valid Email!',
        colorName: 'emerald',
        borderColor: 'border-emerald-500 dark:border-emerald-400',
        focusRing: 'focus:ring-emerald-500/30 focus:border-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-300 font-semibold',
        iconColor: 'text-emerald-500 dark:text-emerald-400',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        progressBg: 'bg-emerald-500',
        percent: 100,
        gradient: 'from-emerald-400 via-teal-500 to-green-600',
        shadowGlow: 'shadow-[0_0_18px_rgba(16,185,129,0.35)]'
      };
    }

    if (hasAt) {
      return {
        stage: 'Entering domain...',
        colorName: 'indigo',
        borderColor: 'border-indigo-500 dark:border-indigo-400',
        focusRing: 'focus:ring-indigo-500/30 focus:border-indigo-500',
        textColor: 'text-indigo-700 dark:text-indigo-300',
        iconColor: 'text-indigo-500 dark:text-indigo-400',
        badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        progressBg: 'bg-indigo-500',
        percent: Math.min(85, 50 + (len - val.indexOf('@')) * 5),
        gradient: 'from-indigo-500 via-purple-500 to-violet-600',
        shadowGlow: 'shadow-[0_0_15px_rgba(99,102,241,0.3)]'
      };
    }

    // Letter by letter dynamic color stages as user types
    const stages = [
      {
        min: 1, max: 3, name: 'Warm Amber',
        borderColor: 'border-amber-400 dark:border-amber-500',
        focusRing: 'focus:ring-amber-500/30 focus:border-amber-500',
        textColor: 'text-amber-700 dark:text-amber-300',
        iconColor: 'text-amber-500',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        progressBg: 'bg-amber-400',
        gradient: 'from-amber-400 to-orange-500',
        shadowGlow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]'
      },
      {
        min: 4, max: 7, name: 'Vibrant Orange',
        borderColor: 'border-orange-500 dark:border-orange-400',
        focusRing: 'focus:ring-orange-500/30 focus:border-orange-500',
        textColor: 'text-orange-700 dark:text-orange-300',
        iconColor: 'text-orange-500',
        badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
        progressBg: 'bg-orange-500',
        gradient: 'from-orange-400 to-pink-500',
        shadowGlow: 'shadow-[0_0_14px_rgba(249,115,22,0.3)]'
      },
      {
        min: 8, max: 11, name: 'Electric Sky',
        borderColor: 'border-sky-500 dark:border-sky-400',
        focusRing: 'focus:ring-sky-500/30 focus:border-sky-500',
        textColor: 'text-sky-700 dark:text-sky-300',
        iconColor: 'text-sky-500',
        badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
        progressBg: 'bg-sky-500',
        gradient: 'from-sky-400 to-blue-600',
        shadowGlow: 'shadow-[0_0_15px_rgba(14,165,233,0.3)]'
      },
      {
        min: 12, max: 99, name: 'Purple Neon',
        borderColor: 'border-purple-500 dark:border-purple-400',
        focusRing: 'focus:ring-purple-500/30 focus:border-purple-500',
        textColor: 'text-purple-700 dark:text-purple-300',
        iconColor: 'text-purple-500',
        badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        progressBg: 'bg-purple-500',
        gradient: 'from-purple-400 to-fuchsia-600',
        shadowGlow: 'shadow-[0_0_16px_rgba(168,85,247,0.3)]'
      }
    ];

    const currentStage = stages.find(s => len >= s.min && len <= s.max) || stages[3];

    return {
      stage: `Typing (${len} letters)`,
      colorName: currentStage.name,
      borderColor: currentStage.borderColor,
      focusRing: currentStage.focusRing,
      textColor: currentStage.textColor,
      iconColor: currentStage.iconColor,
      badgeBg: currentStage.badgeBg,
      progressBg: currentStage.progressBg,
      percent: Math.min(80, (len / 18) * 100),
      gradient: currentStage.gradient,
      shadowGlow: currentStage.shadowGlow
    };
  };

  const colorState = getDynamicColorState(internalValue);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Live typing status header bar */}
      <div className="flex items-center justify-between text-[11px]">
        <label className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          Email Address
          {typedLength > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all duration-300 animate-pulse ${colorState.badgeBg}`}>
              {colorState.stage}
            </span>
          )}
        </label>
        {typedLength > 0 && (
          <span className="font-semibold text-slate-400 dark:text-slate-500 text-[10px]">
            {typedLength} letters typed
          </span>
        )}
      </div>

      {/* Main Input Container with Dynamic Color Shifting */}
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
          className={`w-full rounded-2xl border-2 bg-slate-50/70 dark:bg-slate-900/70 pl-11 pr-10 py-3 text-xs sm:text-sm font-medium focus:outline-none transition-all duration-300 ${colorState.borderColor} ${colorState.focusRing} ${colorState.textColor} ${colorState.shadowGlow}`}
        />

        {/* Right Status Icon */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          {colorState.percent === 100 ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-bounce" />
          ) : error ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : typedLength > 0 ? (
            <Sparkles className={`h-4 w-4 animate-spin ${colorState.iconColor}`} style={{ animationDuration: '3s' }} />
          ) : null}
        </div>
      </div>

      {/* Dynamic Letter Typing Color Bar */}
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
