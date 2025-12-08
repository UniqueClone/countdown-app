import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "./App.css";
import Countdown from "./components/Countdown";
import Controls from "./components/Controls";
import { requestNotificationPermission } from "./ShowNotification";

const nowPlusOneMinute = () => dayjs().second(0).add(1, "minute");
const timePlusOneDay = (time: Dayjs) => dayjs(time).add(1, "day");

function App() {
    const [targetTime, setTargetTime] = useState<Dayjs>(nowPlusOneMinute());
    const [countdownStarted, setCountdownStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        requestNotificationPermission(); // request permission when the app loads, unsure if this is necessary
    }, []);

    // Track small screen state (e.g., < 768px) and update on resize
    useEffect(() => {
        const check = () => setIsSmallScreen(window.innerHeight < 240);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const handleStartCountdown = () => {
        const now = dayjs();
        const target = dayjs(targetTime);
        if (target.isBefore(now) || target.isAfter(now.add(1, "day"))) {
            // if the selected time is more than 24 hours in the past or in the future
            if (
                target.isBefore(now.subtract(1, "day")) ||
                target.isAfter(now.add(1, "day"))
            ) {
                setTargetTime(dayjs(targetTime).date(now.date()));
                handleStartCountdown();
                return;
            } else {
                // if the selected time is in the past but less than 24 hours
                setTargetTime(timePlusOneDay(targetTime));
            }
        } else {
            // if the selected time is in the future
            setTargetTime(targetTime);
        }
        setCountdownStarted(true);
    };

    const handleTargetTimeChange = (date: Dayjs | null) => {
        if (date && date.isValid()) {
            const selectedTime = dayjs(date);
            if (selectedTime.isAfter(dayjs())) {
                if (selectedTime.isAfter(dayjs().add(1, "day"))) {
                    setTargetTime(selectedTime.subtract(1, "day"));
                } else {
                    // if the selected time is in the future
                    setTargetTime(dayjs(date));
                }
                setErrorMessage(null); // clear any previous error message
                setCountdownStarted(false); // reset the countdown
            } else if (selectedTime.isBefore(dayjs())) {
                // if the selected time is in the past, add 24 hours to it
                setTargetTime(selectedTime.add(1, "day")); // 24 hours in milliseconds
                setErrorMessage(null); // clear any previous error message
                setCountdownStarted(false); // reset the countdown
            } else {
                // Display a custom message or use a modal instead of alert
                console.log("Please select a future time.");
                // You can also use a state to show a message in the UI
                setErrorMessage("Please select a future time.");
            }
        } else {
            console.log("Invalid date selected", date);
            setErrorMessage(
                "Invalid date selected. Please select a valid time."
            );
        }
    };

    return (
        <main
            className={
                "container p-4 pt-0 mx-auto min-w-[215px] " +
                (isSmallScreen ? "h-[100vh] min-h-[180px]" : "min-h-[242px]")
            }
        >
            {/* If countdown has not started, show controls */}
            {/* Else, if countdown has started, show countdown and only show controls if not isSmallScreen */}
            {!countdownStarted ? (
                <Controls
                    targetTime={targetTime}
                    onTargetTimeChange={handleTargetTimeChange}
                    onStart={handleStartCountdown}
                    onStop={() => setCountdownStarted(false)}
                    countdownStarted={countdownStarted}
                    errorMessage={errorMessage ?? undefined}
                    nowPlusOneMinute={nowPlusOneMinute}
                    isSmallScreen={isSmallScreen}
                />
            ) : (
                <>
                    {!isSmallScreen && (
                        <Controls
                            targetTime={targetTime}
                            onTargetTimeChange={handleTargetTimeChange}
                            onStart={handleStartCountdown}
                            onStop={() => setCountdownStarted(false)}
                            countdownStarted={countdownStarted}
                            errorMessage={errorMessage ?? undefined}
                            nowPlusOneMinute={nowPlusOneMinute}
                            isSmallScreen={isSmallScreen}
                        />
                    )}

                    <Countdown
                        targetDate={targetTime}
                        onClick={() => setCountdownStarted(!countdownStarted)}
                    />
                </>
            )}
        </main>
    );
}

export default App;
