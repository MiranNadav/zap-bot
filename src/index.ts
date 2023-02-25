import { Telegraf } from 'telegraf';
import { Keyboard, Key } from 'telegram-keyboard';
import { scrape, getProductPriceRange } from './services/zap-scraper';
import { 
    getMySubscriptions, 
    signUpForProductNotifications, 
    removeSubscription 
} from './services/subscriptions-service';
import { chunk, isEmpty } from 'lodash';
import * as dotenv from 'dotenv'
import { CronJob } from 'cron';
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');

const commandsList = [
    { command: '/find', description: 'product to search in zap'},
    { command: '/subscriptions', description: 'list your subscriptions'}
]

bot.telegram.setMyCommands(commandsList)

bot.on('callback_query', async (ctx) => {
    try {
        const callbackQuery = ctx.update.callback_query;
        const chatId = callbackQuery.from.id;
        let callBackData = ('data' in callbackQuery) ? callbackQuery.data.trim() : 'No Product Received';
        const [command, product] = callBackData.split('#');
        switch (command) {
            case CallBacks.REMOVE_SUBSCRIPTION: {
                removeSubscription(product, chatId);
                await ctx.sendMessage(`Removed subscription to ${product}`);
                break;
            }
            case CallBacks.SUBSCRIBE: {
                const priceRange = await getProductPriceRange(product);
                signUpForProductNotifications(product, chatId);
                ctx.reply(`Product ${product} current price range is ${priceRange ? priceRange : 'Not Found :(' }`);
                break;
            }
        }
    } catch (e) {
        console.log(e);
        ctx.reply('Could not find product');
    }
})


bot.command('find', async (ctx) => {
    try {
        const message = ctx.update.message.text;
        const keyword = message.slice(5,);
        if (isEmpty(keyword)){
            await ctx.sendMessage('Did not provide product to search');
        } else {
            const products = await scrape(keyword);
            const buttons =  products.map(product => Key.callback(product.title.slice(0,30), `${CallBacks.SUBSCRIBE}#${product.title}`));
            const keyboard = Keyboard.make(chunk(buttons, 2));
            await ctx.sendMessage('Choose your product', keyboard.inline())
        }
    } catch (err) {
        console.error(`Could not receive details for product`, err);
    }

})

bot.command('subscriptions', async (ctx) => {
    const chatId = ctx.chat.id;
    const mySubscriptions = getMySubscriptions(chatId);
    const buttons =  mySubscriptions.map(product => Key.callback(product.slice(0,30), `${CallBacks.REMOVE_SUBSCRIPTION}#${product.slice(0,30)}`));
    console.log(buttons);
    const keyboard = Keyboard.make(chunk(buttons, 3));
    await ctx.sendMessage('Your Subscriptions', keyboard.inline());
})

// const cronJob = new CronJob('0 12 * * *', async () => {
//     try {
//         console.log('sending message to all subscribers...');
//         await sendMessagesToAllSubscribers();
//     } catch (e) {
//       console.error(e);
//     }
//   });

//   // Start job
//   if (!cronJob.running) {
//     cronJob.start();
//   }

enum CallBacks {
    SUBSCRIBE = 'SUBSCRIBE',
    REMOVE_SUBSCRIPTION = 'REMOVE_SUBSCRIPTION'
}

bot.launch()