import React from "react";
import type { Dayjs } from "dayjs";
import TimePicker from "./TimePicker";

export interface ControlsProps {
    targetTime: Dayjs;
    onTargetTimeChange: (date: Dayjs | null) => void;
    onStart: () => void;
    onStop: () => void;
    countdownStarted: boolean;
    errorMessage?: string;
    nowPlusOneMinute: () => Dayjs;
    isSmallScreen: boolean;
}

/**
 * Controls: screen-agnostic control panel.
 * Contains TimePicker, Reset, Start/Stop, and error message.
 * App decides when to render this component.
 */
const Controls: React.FC<ControlsProps> = ({
    targetTime,
    onTargetTimeChange,
    onStart,
    onStop,
    countdownStarted,
    errorMessage,
    nowPlusOneMinute,
    isSmallScreen,
}) => {
    return (
        <>
            <div className="mb-4">
                <label
                    htmlFor="target-time"
                    className="block text-lg font-medium mb-2"
                >
                    Select Target Time
                </label>

                <TimePicker
                    handleEnterKey={() => onStart()}
                    selectedTime={targetTime}
                    setSelectedTime={onTargetTimeChange}
                />
            </div>

            {!isSmallScreen && (
                <button
                    aria-label="Reset countdown and set target time to 1 minute from now"
                    onClick={() => onTargetTimeChange(nowPlusOneMinute())}
                    className="m-auto mb-4 px-4 py-2 w-30 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                >
                    Reset
                </button>
            )}

            {countdownStarted ? (
                <button
                    onClick={onStop}
                    className="m-auto mb-4 px-4 py-2 min-w-[120px] bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Stop Countdown
                </button>
            ) : (
                <button
                    onClick={onStart}
                    className="m-auto mb-4 px-4 py-2 min-w-[120px] bg-green-700 text-white font-semibold rounded-md shadow hover:bg-green-800 focus:bg-green-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Start Countdown
                </button>
            )}

            {errorMessage && (
                <div className="text-red-500 mt-2">{errorMessage}</div>
            )}
        </>
    );
};

export default Controls;
