import api from './axios'

export const evolutionAPI = {
    createInstance: async (user_id:number,instance_name: string,mobile:string) => {
        const response = await api.post('/evolution/create', { user_id,instance_name,mobile })
        return response.data
    },
    getPairingCode: async (instance_name: string) => {
        const response = await api.get(`/evolution/pairing-code`, {
            params: { instance_name }
        })
        return response.data
    },
    getConnectionState:async(instance_name:string)=>{
        const response = await api.get(`/evolution/connection-state`,{
            params:{instance_name}
        })
        return response.data
    }
}
