import React, { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const Tour = ({ language }: { language: 'en' | 'hi' }) => {
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
                            title: language === 'en' ? 'Dashboard' : 'डैशबोर्ड', 
                            description: language === 'en' ? 'View real-time water quality data and recent community reports at a glance.' : 'वास्तविक समय के पानी की गुणवत्ता डेटा और हाल की सामुदायिक रिपोर्टों को एक नज़र में देखें।',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    { 
                        element: isMobile ? '#mobile-nav-analyze' : '#nav-analyze', 
                        popover: { 
                            title: language === 'en' ? 'Water Analysis' : 'जल विश्लेषण', 
                            description: language === 'en' ? 'Upload photos of water bodies for instant quality assessment.' : 'त्वरित गुणवत्ता मूल्यांकन के लिए जल निकायों की तस्वीरें अपलोड करें।',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    { 
                        element: isMobile ? '#mobile-nav-intel' : '#nav-intel', 
                        popover: { 
                            title: language === 'en' ? 'Intelligence' : 'खुफिया', 
                            description: language === 'en' ? 'Access deep insights, historical trends, and predictive analytics.' : 'गहरी अंतर्दृष्टि, ऐतिहासिक प्रवृत्तियों और भविष्य कहनेवाला विश्लेषण तक पहुंचें।',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    { 
                        element: isMobile ? '#mobile-nav-admin' : '#nav-admin', 
                        popover: { 
                            title: language === 'en' ? 'Admin Map' : 'व्यवस्थापक मानचित्र', 
                            description: language === 'en' ? 'Visualize data on an interactive map for better governance and planning.' : 'बेहतर शासन और योजना के लिए एक इंटरैक्टिव मानचित्र पर डेटा की कल्पना करें।',
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    {
                        popover: {
                            title: language === 'en' ? 'You are all set!' : 'आप पूरी तरह तैयार हैं!',
                            description: language === 'en' ? 'Explore the platform and help us keep our water clean. Click "Done" to start.' : 'मंच का अन्वेषण करें और हमारे पानी को साफ रखने में हमारी मदद करें। शुरू करने के लिए "संपन्न" पर क्लिक करें।',
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
    }, [language]);

    return null; // This component doesn't render anything visible
};
