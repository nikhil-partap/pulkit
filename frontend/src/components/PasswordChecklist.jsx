import React from 'react';
import { Check, X } from 'lucide-react';
import { PASSWORD_RULES } from '../services/passwordRules';

// Live list of password requirements, ticked off as the user types.
export default function PasswordChecklist({ password, id }) {
  return (
    <ul className="password-checklist" id={id} aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.key} className={met ? 'is-met' : ''}>
            {met ? <Check size={12} /> : <X size={12} />}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
