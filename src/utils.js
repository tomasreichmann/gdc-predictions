import { setWith, clone } from 'lodash';
export const immutableSet = (dataSet, path, newValue) => setWith({ ...dataSet }, path, newValue, clone);