import React, { useState, useEffect } from "react";
import { showNotification } from "./ShowNotification";

interface CountdownProps {
    targetDate: Date;
}

interface TimeLeft {
    // days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +targetDate - +new Date();
        let timeLeft: TimeLeft;

        if (difference > 0) {
            timeLeft = {
                // days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = {
                // days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [notificationSent, setNotificationSent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    useEffect(() => {
        if (
            // timeLeft.days === 0 &&
            timeLeft.hours === 0 &&
            timeLeft.minutes === 0 &&
            timeLeft.seconds === 0 &&
            notificationSent === false
        ) {
            showNotification({
                title: "Time's up!",
                body: "The countdown has ended.",
            });
            setNotificationSent(true);
        }
    }, [timeLeft]);

    const timerComponents: JSX.Element[] = [];

    (Object.keys(timeLeft) as (keyof TimeLeft)[]).forEach((interval) => {
        if (!timeLeft[interval]) {
            return;
        }

        timerComponents.push(
            <span key={interval} className="mx-1 text-lg font-semibold">
                {timeLeft[interval]} {interval}{" "}
            </span>
        );
    });

    // TODO: Add a notification when the timer reaches 0
    // Can use tauri notifications for this
    return (
        <div className="flex justify-center space-x-2">
            {timeLeft.hours > 0 ||
            timeLeft.minutes > 0 ||
            timeLeft.seconds > 0 ? (
                <div className="bg-green-800 text-white p-6 rounded-lg shadow-lg w-[250px] max-w-[250px] h-[132px] flex-col items-center justify-center content-center">
                    {timerComponents.map((component, index) => (
                        <div key={index}>{component}</div>
                    ))}
                </div>
            ) : (
                <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
                    <span className="text-lg font-semibold animate-[ping_1s_ease-in-out_infinite]">
                        Time's up!
                    </span>
                </div>
            )}
        </div>
    );
};

export default Countdown;
