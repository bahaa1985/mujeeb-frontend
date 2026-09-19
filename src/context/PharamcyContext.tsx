import {createContext, useContext} from 'react'
import type{ Pharmacy } from '../types/pharmacy'
import type{ Subscription } from '../types/subscription'

interface PharmacyContextType {
    pharmacy: Pharmacy | null;
    setPharmacy: (pharmacy: Pharmacy | null) => void;
    plan: Subscription | null;
    setPlan: (subscription: Subscription | null) => void;
}


export const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined)


/**
 * custom hook to use PharmacyContext
 * @returns 
 */
export const usePharmacy = () => {
    const context = useContext(PharmacyContext)
    if (!context) {
        throw new Error('usePharmacy must be used within a PharmacyProvider')
    }
    return context
}