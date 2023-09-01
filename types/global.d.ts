type DepolyObject<T extends string | number | symbol, U> = {
    [key in T]: U;
};


