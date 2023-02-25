export interface SignUps {
    [key: string]: ProductInfo
}

export interface ProductInfo {
    chatIds: Array<number>;
    priceRange: string;
    lastUpdate: Date;
}

export const signUps : SignUps = {}

export const signUpForProductNotifications = (product: string, chatId: number) => {
    if (!signUps[product]) {
      signUps[product] = {chatIds: [], priceRange: '', lastUpdate: new Date()};
    }
    if (signUps[product].chatIds.indexOf(chatId) === -1) {
        signUps[product].chatIds.push(chatId);
    } else {
        console.log(`User already signed to product ${product} updates`);
    }
}

export const getMySubscriptions = (chatId: number) => {
    const products = Object.keys(signUps);
    const mySubscribedProducts = [];
    for (const product of products) {
        const { chatIds } = signUps[product];
        chatIds.includes(chatId) && mySubscribedProducts.push(product);
    }
    return mySubscribedProducts;
}

export const removeSubscription = (product: string, chatId: number) => {
    const { chatIds = []} = signUps[product] || {};
    const index = chatIds.indexOf(chatId);
    if (index > -1) {
        console.log(`removing ${chatId} from product ${product}`);
        chatIds.splice(index, 1);
    }
}

export const sendProductUpdates = () => {
    
}