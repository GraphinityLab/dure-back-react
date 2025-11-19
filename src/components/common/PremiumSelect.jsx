import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const PremiumSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => {
    const optValue = typeof opt === 'object' ? opt.value : opt;
    return optValue === value;
  });

  const displayValue = selectedOption
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : placeholder;

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <motion.button
        type="button"
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3.5 
          bg-white/70 backdrop-blur-xl 
          rounded-2xl border border-white/50 
          text-left text-sm md:text-base
          shadow-lg transition-all duration-300
          flex items-center justify-between gap-3
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/90 hover:shadow-xl cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f]
          text-[#3c2b21]
        `}
      >
        <span className={`flex-1 truncate ${!selectedOption ? 'text-[#9b8a83]' : ''}`}>
          {displayValue}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-[#6b5c55] shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.25)] overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-thumb-rounded-full scrollbar-track-transparent">
                {options.length > 0 ? (
                  options.map((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const isDisabled = typeof option === 'object' && option.disabled;
                    const isSelected = optionValue === value;

                    return (
                      <motion.button
                        key={optionValue}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={!isDisabled ? { scale: 1.02, x: 4 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        onClick={() => !isDisabled && handleSelect(optionValue)}
                        disabled={isDisabled}
                        className={`
                          w-full px-4 py-3 text-left text-sm
                          transition-all duration-200
                          flex items-center gap-2
                          ${
                            isDisabled
                              ? 'text-[#9b8a83] cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white'
                              : 'text-[#3c2b21] hover:bg-white/60 cursor-pointer'
                          }
                        `}
                      >
                        {isSelected && !isDisabled && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-white"
                          />
                        )}
                        <span className="flex-1">{optionLabel}</span>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-[#6b5c55] text-center">
                    No options available
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumSelect;

