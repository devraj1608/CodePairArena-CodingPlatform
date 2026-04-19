export const defaultCodes = {
    cpp: `#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
    c: `#include<stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
    java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    python: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
};

export const enterFullScreen = () => {
    const element = document.documentElement;
    try {
        if (element.requestFullscreen) {
            const promise = element.requestFullscreen();
            if (promise) {
                promise.catch(() => {}); // Suppress the 'Permissions check failed' TypeError in console
            }
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } catch (error) {
        // Silently ignore fullscreen sync errors
    }
};

export const generateRoomId = (mode = 'single') => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Add prefix based on mode to distinguish 1-on-1 from group sessions
    const prefix = mode === 'group' ? 'GRP_' : '1ON_';
    return prefix + roomId;
};