import React, { useState, useEffect } from "react";
import { showNotification } from "./ShowNotification";
import dayjs, { Dayjs } from "dayjs";

interface CountdownProps {
    targetDate: Dayjs;
}

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

/**
 * Handle non-plural intervals, e.g. "hour" instead of "hours"
 * @param interval
 * @param value
 * @returns
 */
const handleNonPluralInterval = (interval: string, value: number): string => {
    return value === 1 ? interval.slice(0, -1) + " " : interval;
};

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = dayjs(targetDate).diff(dayjs());
        let timeLeft: TimeLeft;

        if (difference > 0) {
            timeLeft = {
                // days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                milliseconds: Math.floor(difference % 1000),
            };
        } else {
            timeLeft = {
                // days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [notificationSent, setNotificationSent] = useState(false);

    useEffect(() => {
        const now = dayjs();
        const millisecondsUntilNextSecond = 1000 - now.millisecond();

        const timeout = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, millisecondsUntilNextSecond);

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Cleanup interval and timeout on component unmount or effect re-run
        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, []);

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
        if (!timeLeft[interval] && interval !== "seconds") {
            return;
        }

        if (interval === "milliseconds") {
            return;
        }

        timerComponents.push(
            <span key={interval} className="mx-1 text-lg font-semibold">
                {timeLeft[interval]}{" "}
                {handleNonPluralInterval(interval, timeLeft[interval])}
            </span>
        );
    });

    return (
        <div className="flex justify-center space-x-2">
            {timeLeft.hours > 0 ||
            timeLeft.minutes > 0 ||
            timeLeft.seconds > 0 ? (
                <div className="bg-green-800 text-white p-6 rounded-lg shadow-lg w-[250px] max-w-[250px] h-[132px] flex-col items-center justify-center content-center animate-[pulse_4s_ease-in-out_infinite]">
                    {timerComponents.map((component, index) => (
                        <div key={index}>{component}</div>
                    ))}
                </div>
            ) : (
                <div className="bg-red-500 w-[250px] max-w-[250px] h-[132px] p-6 flex-col content-center font-semibold text-white rounded-lg shadow-lg">
                    <span className="text-lg font-semibold animate-[ping_1s_ease-in-out_infinite]">
                        Time's up!
                    </span>
                </div>
            )}
        </div>
    );
};

export default Countdown;
