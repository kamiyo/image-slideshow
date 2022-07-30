declare module 'app-root-path' {
    class AppRootPath {
        resolve: (pathToModule: string) => string;
        require: (pathToModule: string) => string;
        toString: () => string;
        setPath: (explicitlySetPath: string) => void;
        path: string;
    }

    export { AppRootPath }
}