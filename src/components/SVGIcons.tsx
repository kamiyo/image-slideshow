import * as React from 'react';
import { GearWithAxle } from 'svg-gear-generator';

export const FullScreen: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 144 144">
            <path d="M50 0H0V50m0 28v50H50m28 0h50v-50m0 -28V0h-50" strokeLinecap="round" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const ExitFullScreen: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 144 144">
            <path d="M50 0V50H0m0 28H50v50m28 0v-50h50m0 -28h-50V0" strokeLinecap="round" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const Play: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 148 148">
            <path d="M17.149 0L128 64L17.149 128z" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const Pause: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 148 148">
            <path d="M32 0V128M96 0V128" strokeWidth={6} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const Minus: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-72 -72 144 144">
            <path d="M-64 0H64" strokeWidth={16} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const Plus: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-72 -72 144 144">
            <path d="M-64 0H64M0 -64V64" strokeWidth={16} shapeRendering="geometricPrecision" />
        </svg>
    );
};

export const Settings = React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGElement>>((props, ref) => {
    return (
        <svg ref={ref} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-72 -72 144 144">
            <GearWithAxle
                axleRadius={32}
                radii={{ inner: 52, outer: 62 }}
                numTeeth={9}
                toothThicknessPercent={0.6}
                strokeWidth={6}
                strokeLinejoin="round"
            />
        </svg>
    )
});

export const Github: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
    );

};