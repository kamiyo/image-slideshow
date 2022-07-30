import * as React from 'react';

export const FullScreen: React.FC<React.SVGAttributes<unknown>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 144 144">
            <path d="M50 0H0V50m0 28v50H50m28 0h50v-50m0 -28V0h-50" strokeLinecap="round" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const ExitFullScreen: React.FC<React.SVGAttributes<unknown>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 144 144">
            <path d="M50 0V50H0m0 28H50v50m28 0v-50h50m0 -28h-50V0" strokeLinecap="round" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const Play: React.FC<React.SVGAttributes<unknown>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 148 148">
            <path d="M17.149 0L128 64L17.149 128z" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const Pause: React.FC<React.SVGAttributes<unknown>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 148 148">
            <path d="M32 0V128M96 0V128" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};