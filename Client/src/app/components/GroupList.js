import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import axios from 'axios';

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
    return (
        <motion.div
            ref={ref}
            data-index={index}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.2, delay }}
            className="mb-4 cursor-pointer"
        >
            {children}
        </motion.div>
    );
};

const GroupList = ({
    items = ["Global"],
    onItemSelect,
    showGradients = false,
    enableArrowNavigation = true,
    className = '',
    itemClassName = '',
    displayScrollbar = false,
    initialSelectedIndex = -1
}) => {
    const listRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
    const [keyboardNav, setKeyboardNav] = useState(false);
    const [topGradientOpacity, setTopGradientOpacity] = useState(0);
    const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleScroll = e => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        setTopGradientOpacity(Math.min(scrollTop / 50, 1));
        const bottomDistance = scrollHeight - (scrollTop + clientHeight);
        setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
    };

    useEffect(() => {
        if (!enableArrowNavigation) return;
        const handleKeyDown = e => {
            if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
                e.preventDefault();
                setKeyboardNav(true);
                setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
            } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
                e.preventDefault();
                setKeyboardNav(true);
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    e.preventDefault();
                    if (onItemSelect) {
                        onItemSelect(items[selectedIndex], selectedIndex);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

    useEffect(() => {
        if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
        const container = listRef.current;
        const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
        if (selectedItem) {
            const extraMargin = 50;
            const containerScrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const itemTop = selectedItem.offsetTop;
            const itemBottom = itemTop + selectedItem.offsetHeight;
            if (itemTop < containerScrollTop + extraMargin) {
                container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
            } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
                container.scrollTo({
                    top: itemBottom - containerHeight + extraMargin,
                    behavior: 'smooth'
                });
            }
        }
        setKeyboardNav(false);
    }, [selectedIndex, keyboardNav]);

    const [groupName, setGroupName] = useState('');

    const createGroup = () => {
        console.log("Creating group:", groupName);
        axios.post('https://localhost:5242/api/group',`"${groupName}"`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
                }
            }).then(response => {
                console.log("Group created:", response.data);
                setGroupName('');
            }
        ).catch(error => {
            console.error("Error creating group:", error);
        });


    closeModal();
    }

    return (
        <div className={`relative w-full h-full ${className}`}>
            {!showModal ? (
                <>
                    <div
                        ref={listRef}
                        className={`max-h-[450px] overflow-y-auto p-4 ${displayScrollbar
                                ? '[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]'
                                : 'scrollbar-hide'
                            }`}
                        onScroll={handleScroll}
                        style={{
                            scrollbarWidth: displayScrollbar ? 'thin' : 'none',
                            scrollbarColor: '#222 #060010'
                        }}
                    >
                        {items.map((item, index) => (
                            <AnimatedItem
                                key={index}
                                delay={0.1}
                                index={index}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => {
                                    setSelectedIndex(index);
                                    if (onItemSelect) {
                                        onItemSelect(item, index);
                                    }
                                }}
                            >
                                <div className={`p-4 bg-blue-950 rounded-lg hover:bg-amber-500 ${selectedIndex === index ? 'bg-[#222]' : ''} ${itemClassName}`}>
                                    <p className="text-white m-0">{item.name}</p>
                                </div>
                            </AnimatedItem>
                        ))}
                    </div>
                    <button
                        className="bg-blue-800 hover:bg-blue-700 text-white p-1 w-full h-[70px] shadow-lg transition-opacity duration-300 ease cursor-pointer rounded-lg"
                        onClick={openModal}
                    >
                        Add Group
                    </button>
                    {showGradients && (
                        <>
                            <div
                                className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
                                style={{ opacity: topGradientOpacity }}
                            ></div>
                            <div
                                className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
                                style={{ opacity: bottomGradientOpacity }}
                            ></div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <div
                        ref={listRef}
                        className="max-h-[450px] overflow-y-auto p-4 ">

                        <div className="flex flex-col items-center justify-center bg-blue-900 rounded-lg p-4 h-[418px]">
                            <input type="text" onChange={(e) => setGroupName(e.target.value)} className="w-full h-10 rounded-md p-4 bg-blue-950 mb-4" placeholder="Group Name" />
                            <button type="button" onClick={closeModal} className="w-full h-10 rounded-md p-2 bg-red-600 cursor-pointer hover:bg-red-500">
                                Cancel
                            </button>
                        </div>

                    </div>
                    <button
                        className="bg-blue-800 hover:bg-blue-700 text-white p-1 w-full h-[70px] shadow-lg transition-opacity duration-300 ease cursor-pointer rounded-lg items-end"
                        onClick={createGroup}
                    >
                        Add Group
                    </button>
                    {showGradients && (
                        <>
                            <div
                                className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
                                style={{ opacity: topGradientOpacity }}
                            ></div>
                            <div
                                className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
                                style={{ opacity: bottomGradientOpacity }}
                            ></div>
                        </>
                    )}
                </>
            )}
        </div>
    )
};

export default GroupList;