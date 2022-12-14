import axios from "axios";
import { createContext, useMemo, useState } from "react";
import { toast } from "react-toastify";
import OperationPayload from "../interfaces/operationPayload";
import UserLoginPayload from "../interfaces/userLoginPayload";

export const AuthContext = createContext({});

export default function AuthProvider({ children }: any): JSX.Element {
    const url = 'https://integracao-front-back-api.herokuapp.com';
    const defaultAccount = 0;

    const [user, setUser] = useState<any | null>();
    //const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState();

    //GET LOCALSTORAGE
    const memorizedUser = useMemo(() => {
        if (!user) {
            const userStorage = localStorage.getItem('user');
            const userParsed  = userStorage && JSON.parse(userStorage);

            setUser(userParsed);

            return userParsed;
        }

        return user;
    }, [user])

    //SAVE LOCALSTORAGE
    const storageUser = (data: JSON) => {
        try {
            const userStringfy = JSON.stringify(data);
            localStorage.setItem('user', userStringfy);
        } 
        catch (error: any) {
            console.log(`message :>> ${error.message}`);
        }
    }

    //GET BALANCE
    const getBalance = async () => {
        try {
            const { data } = await axios.get(`${url}/account/balance/${user.email}`);
            setBalance(data);
        }
        catch (error: any) {
            toast.error(`Error :>> ${error.message}`);
        }
    }

    //OPERATIONS
    const createOperation = async (data: OperationPayload) => {
        try {
            await axios.post(`${url}/account/operation`, data);
            await getBalance();

            toast.success('Operação realizada');
        } 
        catch (error: any) {
            toast.error('Erro na transferência');
            console.error(error.message);
        }
        
    }

    const getOperations = async () => {
        try {
            const data = await axios.get(`${url}/account/operation/${user.email}`);
            const operations: OperationPayload[] = data.data;

            return  operations;
        }
        catch (error: any) {
            toast.error(`Error :>> ${error.message}`);
        }
    }

    //CREATE USER - SIGNUP
    const signUp = async (data: JSON | any): Promise<void> => {
        try {
            await axios.post(`${url}/user`, {...data, account: {}});

            const newUser = await axios.get(`${url}/user/${data.email}`);
            console.log(newUser.data);

            storageUser(newUser.data);
            setUser(newUser.data);

            toast.success(`Usuário cadastrado`);
        }
        catch (error: any) {
            toast.error(`Error :>> ${error.message}`);
        }
    }

    //LOGIN
    const signIn = async (userData: UserLoginPayload): Promise<void> => {
        try {
            const { data } = await axios.post(`${url}/user/login`, userData);

            if (!data.user) {
                toast.error(data.message);
                return
            };
            
            storageUser(data.user);
            setUser(data.user);

            toast.success(data.message);
        }
        catch (error: any) {
            toast.error(error.message);
        }
    }

    //LOGOUT
    const logout = () => {
        try {
            localStorage.removeItem('user');
            setUser(null);
            toast.success('Usuário deslogado');
        } 
        catch (error: any) {
            toast.error(error.message);
        }
    }

    return (
        <AuthContext.Provider 
            value={{
                signed: !!memorizedUser,
                user,
                signUp, 
                signIn,
                logout,
                balance,
                getBalance,
                createOperation,
                getOperations,
                defaultAccount
            }}
        >
            { children }
        </AuthContext.Provider>
    )
};
