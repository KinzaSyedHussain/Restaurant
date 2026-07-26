import React, { useEffect, useState } from "react";
import './style.css';

const customers_list = [
    { id: 'egg', name: 'Cutie', img: 'Cutie.png' },
    { id: 'jobless', name: 'Jobless', img: 'jobless.png' },
    { id: 'magician', name: 'Magician', img: 'magician.png' },
    { id: 'michaelJ', name: 'MichaelJ', img: 'michaelJ.png' },
    { id: 'princess', name: 'Princess', img: 'princess.png' }
];
                                     
const menu_list = [
    { id: 'burger', name: 'Burger', price: 12, img: 'burger.png' },
    { id: 'pizza', name: 'Pizza', price: 15, img: 'pizza.png' },
    { id: 'fries', name: 'Fries', price: 5, img: 'fries.png' },
    { id: 'nuggets', name: 'Nuggets', price: 7, img: 'nuggets.png' },
    { id: 'coke', name: 'Soda', price: 3, img: 'coke.png' },
    { id: 'coffee', name: 'Coffee', price: 5, img: 'COFFEE.png' },
    { id: 'strawberry', name: 'Ice cream', price: 3, img: 'strawberry.png' },
    { id: 'cake', name: 'Cake', price: 6, img: 'CAKE.png' },
    { id: 'buritto', name: 'Buritto', price: 8, img: 'buritto.png' }
];

const currency_tags = [
    { id: 'bill-50', value: 50, img: 'fifty.png', label: '$50', isCoin: false },
    { id: 'bill-20', value: 20, img: 'twenty.png', label: '$20', isCoin: false },
    { id: 'bill-5', value: 5, img: 'five.png', label: '$5', isCoin: false },
    { id: 'bill-2', value: 2, img: 'two.png', label: '$2', isCoin: true },
    { id: 'bill-1', value: 1, img: 'one.png', label: '$1', isCoin: true }
]

const generateRandomOrder = () => {
    const itemQuantity = Math.floor(Math.random() * 3) + 1;
    const selectedItems = [];
    for (let i = 0; i < itemQuantity; i++) {
        const randomItem = menu_list[Math.floor(Math.random() * menu_list.length)];
        selectedItems.push(randomItem);
    }
    return selectedItems;
};

export default function RestaurantGame() {
    const [currentCustomer, setCurrentCustomer] = useState(customers_list[0]);
    const [customerOrder, setCustomerOrder] = useState([menu_list[0]]);
    const [servedItems, setServedItems] = useState([]);
    const [orderServed, setOrderServed] = useState(false);
    const [earnings, setEarnings] = useState(0);
    const [cashReceived, setCashReceived] = useState(0);
    const [terminalText, setTerminalText] = useState(`Hi there! I would like 1 ${menu_list[0].name}, please!`);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameOver, setGameOver] = useState(false);
    const totalOrderPrice = customerOrder.reduce((sum, item) => sum + item.price, 0);
    const balanceRemaining = totalOrderPrice - cashReceived;
    const isOrderComplete = orderServed && balanceRemaining <= 0;

    useEffect(() => {
        if (gameOver || isOrderComplete) return;

        if (timeLeft === 0) {
            setGameOver(true);
            setTerminalText("Time's Up! You took too long!😡 ");
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev -1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameOver, isOrderComplete]);

    const onDragStart = (event, itemId, itemType) => {
        if (gameOver) return;
        event.dataTransfer.setData('itemId', itemId);
        event.dataTransfer.setData('itemType', itemType);
    };

    const onCutomerDrop = (event) => {
        event.preventDefault();
        if (orderServed || gameOver) return;

        const id = event.dataTransfer.getData('itemId');
        const type = event.dataTransfer.getData('itemType');

        if (type === 'food') {
            const unservedOrder = customerOrder.filter((_, index) => !servedItems.includes(index));
            const matchingIndex = customerOrder.findIndex((item, index) => item.id === id && !servedItems.includes(index));

            if (matchingIndex !== -1) {
                const updatedServed = [...servedItems, matchingIndex];
                setServedItems(updatedServed);

                if (updatedServed.length === customerOrder.length) {
                    setOrderServed(true);
                    setTerminalText(`Yummy! Here is $${totalOrderPrice} for the order. Drop the cash into the register drawer!`);
                } else {
                    const remainingNames = customerOrder
                        .filter((_, idx) => !updatedServed.includes(idx))
                        .map(i => i.name)
                        .join(', ');
                    setTerminalText(`Got it! I still need: ${remainingNames}`);
                }
            } else {
                setTerminalText(`Oops! I didn't order that.`);
            }
        }
    };

    const onDrawerDrop = (event) => {
        event.preventDefault();
        if (!orderServed || gameOver) return;
        const id = event.dataTransfer.getData('itemId');
        const type = event.dataTransfer.getData('itemType');

        if (type === 'money') {
            const match = currency_tags.find((m) => m.id === id);
            if (match) {
                setCashReceived((prev) => prev + match.value);
            }
        }
    };

    const serveNextCustomer = () => {
        const newOrder = generateRandomOrder();
        const randomCustomer = customers_list[Math.floor(Math.random() * customers_list.length)];
        const newOrderTotalPrice = newOrder.reduce((sum, item) => sum + item.price, 0);

        setCurrentCustomer(randomCustomer);
        setCustomerOrder(newOrder);
        setServedItems([]);
        setOrderServed(false);
        setEarnings((prev) => prev + totalOrderPrice);
        setCashReceived(0);
        setTimeLeft(10 + (newOrder.length - 1) * 5); 
        setGameOver(false);

        const orderText = newOrder.map(i => i.name).join(', ');
        setTerminalText(`Hello! Can I please get: ${orderText}?`);
    };

    const resetRestaurant = () => {
        setEarnings(0);
        setCashReceived(0);
        setOrderServed(false);
        setServedItems([]);
        setCurrentCustomer(customers_list[0]);
        setCustomerOrder([menu_list[0]]);
        setTerminalText(`Hi there! I would like to order 1 ${menu_list[0].name}, please!`);
        setTimeLeft(15);
        setGameOver(false);
    };

    return (
        <div className="restaurant">
            <header className="mainheader">
                <h1> RESTAURANT </h1>
                <button className="utility-button destructive-reset" onClick={resetRestaurant}>
                    Reset Restaurant
                </button>
            </header>

            <main className="restaurant-stage">
                <section className="controlsidebar">
                    <div className="posterminal">
                        <h3>📟 Counter </h3>
                        <div className={`timer-display ${timeLeft <= 3 ? 'timer-warning' : ''}`} style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: timeLeft <= 3 ? '#ff4d4d' : '#00ffcc',
                            marginBottom: '10px'
                        }}> Time Left: {timeLeft}s </div>

                        <div className="digitaldisplay">
                            {`Total Earnings: $${earnings}\nOrder Price: $${totalOrderPrice}\nPaid: $${cashReceived}\n\nStatus: ${
                                gameOver 
                                    ? 'GAME OVER! ❌' 
                                    : !orderServed 
                                    ? `Serving Items (${servedItems.length}/${customerOrder.length})` 
                                    : balanceRemaining > 0 
                                    ? 'Collect Cash!' 
                                    : 'Order Complete! 🎉'
                            }`}
                        </div>
                        {gameOver ? (
                            <button className="paytriggertag bill-btn" style={{ width: '100%', marginTop: '10px', backgroundColor: '#ff4d4d' }} onClick={resetRestaurant}>
                                🔄 Try Again
                            </button>
                        ) : isOrderComplete ? (
                            <button className="paytriggertag bill-btn" style={{ width: '100%', marginTop: '10px' }} onClick={serveNextCustomer}>
                                Next Customer →
                            </button>
                        ) : (
                            <div
                                className="counterscanner counter-open"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={onDrawerDrop}
                            >
                                <img src="COUNTER_OPEN.png" alt="Open Register" className="countergraphics" />
                            </div>
                        )}
                    </div>
                </section>
                
                <section className="customer-area" onDragOver={(e) => e.preventDefault()} onDrop={onCutomerDrop}>
                    <div className="speech-bubble">
                        <p>{terminalText}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', position: 'relative' }}>
                        <div className="egg-customer-wrapper">
                            <img src={currentCustomer.img} alt={currentCustomer.name} className="egg-character" draggable={false} />
                        </div>

                        {orderServed && balanceRemaining > 0 && !gameOver && (
                            <div className="registerdrawer drawer-animated-entrance" style={{ position: 'relative', margin: 0 }}>
                                <div className="moneytagwallet">
                                    {currency_tags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="moneytagelement"
                                            draggable={true}
                                            onDragStart={(e) => onDragStart(e, tag.id, 'money')}
                                        >
                                            <img src={tag.img} alt={tag.label} className={tag.isCoin ? "cash-coin-asset" : "cash-bill-asset"} />
                                            <span className="cash-tag-label">{tag.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="brown-desk">
                        <span className="desk-label">Order Counter</span>
                    </div>
                </section>

                <section className="kitchen-shelf">
                    <h3>🍔 Kitchen Menu</h3>
                    <div className="menu-grid">
                        {menu_list.map((food) => (
                            <div
                                key={food.id}
                                className="productcard"
                                draggable={!orderServed}
                                onDragStart={(e) => onDragStart(e, food.id, 'food')}
                            >
                                <img src={food.img} alt={food.name} className="productthumb" draggable={false} />
                                <p className="product-title">{food.name}</p>
                                <span className="productpricetag">${food.price}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}