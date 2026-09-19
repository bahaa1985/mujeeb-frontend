import React , {useState, useEffect} from 'react';
import { PharmacyContext } from './PharamcyContext';
import type { Pharmacy } from '../types/pharmacy';
import type { Subscription } from '../types/subscription';
import { pharmacyAPI } from '../api/pharmacyAPI';
import { subscriptionAPI } from '../api/subscriptionAPI';
import { useAuth } from './AuthContext';

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [plan, setPlan] = useState<Subscription | null>(null);
    const user = useAuth().user

    useEffect(() => {
        const fetchData = async (pharmacyId: number) => {
            if (!pharmacyId) return;
            try {
                const [pharmacyData, subscriptionData] = await Promise.all([
                    pharmacyAPI.getPharmacyById(pharmacyId),
                    subscriptionAPI.getPharmacySubscription(pharmacyId)
                ]);
                
                if (pharmacyData) setPharmacy(pharmacyData);
                if (subscriptionData) setPlan(subscriptionData);
                
                console.log("Pharmacy and plan data loaded", { pharmacyData, subscriptionData });
            } catch (error) {
                console.error("Error fetching pharmacy/plan data:", error);
                setPharmacy(null);
                setPlan(null);
            }
        };
        fetchData(user?.pharmacy_id || 0);
    }, [user?.pharmacy_id]);

    return (
        <PharmacyContext.Provider value={{ pharmacy, setPharmacy, plan, setPlan }}>
            {children}
        </PharmacyContext.Provider>
    );
}

