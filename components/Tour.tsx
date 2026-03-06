import React, { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const Tour: React.FC = () => {
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        
        if (!hasSeenTour) {
            const isMobile = window.innerWidth < 768;
            
            const driverObj = driver({
                showProgress: true,
                animate: true,
                steps: [
                    { 
                        element: isMobile ? '#mobile-nav-home' : '#nav-home', 
                        popover: { 
                            title: 'Dashboard', 
                            description: 'View real-time water quality data and recent community reports at a glance.',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    { 
                        element: isMobile ? '#mobile-nav-analyze' : '#nav-analyze', 
                        popover: { 
                            title: 'AI Analysis', 
                            description: 'Upload photos of water bodies for instant AI-powered quality assessment.',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    { 
                        element: isMobile ? '#mobile-nav-intel' : '#nav-intel', 
                        popover: { 
                            title: 'Intelligence', 
                            description: 'Access deep insights, historical trends, and predictive analytics.',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    { 
                        element: isMobile ? '#mobile-nav-admin' : '#nav-admin', 
                        popover: { 
                            title: 'Admin Map', 
                            description: 'Visualize data on an interactive map for better governance and planning.',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    {
                        popover: {
                            title: 'You are all set!',
                            description: 'Explore the platform and help us keep our water clean. Click "Done" to start.',
                        }
                    }
                ],
                onDestroyStarted: () => {
                    localStorage.setItem('hasSeenTour', 'true');
                    driverObj.destroy();
                },
            });

            // Small delay to ensure DOM is ready
            setTimeout(() => {
                driverObj.drive();
            }, 1000);
        }
    }, []);

    return null; // This component doesn't render anything visible
};
