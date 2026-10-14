import React from 'react';
import '../../styles/BookingStepper.css';
import '../../styles/Mobile.css';

export const BOOKING_STEPS = [
  { id: 1, label: 'Booking Details' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Documentation' },
  { id: 4, label: 'Confirmation' },
];

function BookingStepper({ currentStep = 1, steps = BOOKING_STEPS }) {
  return (
    <nav aria-label="Booking progress">
      <ol className="stepper">
        {steps.map((step) => {
          const state =
            step.id < currentStep ? 'done' : step.id === currentStep ? 'current' : 'upcoming';

          return (
            <li
              key={step.id}
              className={`stepper-item is-${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="stepper-circle" aria-hidden="true">
                {state === 'done' ? (
                  <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
                    <path
                      d="M3.5 8.5l3 3 6-6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </span>
              <span className="stepper-label">
                {step.label}
                <span className="visually-hidden">
                  {state === 'done' ? ' (completed)' : state === 'current' ? ' (current step)' : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default BookingStepper;
