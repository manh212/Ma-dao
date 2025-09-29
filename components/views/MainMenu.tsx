/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import * as db from '../../services/db';
import { sanitizeTextForClassName } from '../../utils/text';
import './MainMenu.css';

interface MainMenuProps {
    onNavigate: (view: string) => void;
    onOpenApiKeyModal: () => void;
    onOpenSettingsModal: () => void;
    onOpenChangelogModal: () => void;
    apiStatus: string;
}

const GENRE_QUOTES: Record<string, string[]> = {
    'default': ["Vận mệnh chưa định đoạt, câu chuyện đang chờ bạn viết nên."],
    'Quản lý Nhóm nhạc': [
        "Ánh đèn sân khấu đang chờ, nhưng con đường đến đó đầy chông gai.",
        "Thành công được tạo nên từ những quyết định ở hậu trường.",
        "Một ngôi sao vụt sáng, hay một thiên thạch lụi tàn?"
    ],
    'Đồng nhân': [
        "Một câu chuyện quen thuộc, một góc nhìn hoàn toàn mới.",
        "Nếu có thể thay đổi một chi tiết, liệu kết cục có khác đi?",
        "Số phận của họ, giờ nằm trong tay bạn."
    ],
    'Dị Giới Fantasy': [
        "Nơi kiếm và ma thuật định hình nên thế giới.",
        "Một thế giới mới, một cuộc đời mới, một định mệnh mới.",
        "Anh hùng không được sinh ra, họ được tạo nên từ thử thách."
    ],
    'Tu Tiên': [
        "Vấn đạo trường sinh, nghịch thiên cải mệnh.",
        "Một hạt bụi có thể lấp biển, một cọng cỏ có thể chém trời.",
        "Con đường tu tiên, vạn người đi mấy ai đến đích?"
    ],
    'Võ Lâm': [
        "Nhân tại giang hồ, thân bất do kỷ.",
        "Nơi nào có người, nơi đó có ân oán.",
        "Võ công cao đến đâu, cũng không qua được chữ tình."
    ],
    'Đô Thị Hiện Đại': [
        "Dưới ánh đèn neon, những bí mật vẫn ẩn mình trong bóng tối.",
        "Quyền lực, tiền bạc và tình yêu, bạn sẽ chọn cái gì?",
        "Trong thành phố không ngủ, mỗi người đều có một câu chuyện."
    ],
    'Huyền Huyễn Truyền Thuyết': [
        "Khi những truyền thuyết cổ xưa không còn là huyền thoại.",
        "Cuộc chiến giữa Thần và Ma chưa bao giờ kết thúc.",
        "Sức mạnh có thể hủy diệt thế giới, hoặc cứu rỗi nó."
    ],
};

export const MainMenu = ({ onNavigate, onOpenApiKeyModal, onOpenSettingsModal, onOpenChangelogModal, apiStatus }: MainMenuProps) => {
    const [dynamicTitle, setDynamicTitle] = useState('Hãy cố gắng cho tương lai tốt hơn');
    const [lastGenre, setLastGenre] = useState('default');

    useEffect(() => {
        const fetchLastGenreAndSetTitle = async () => {
            try {
                const allSaves = await db.getAllSaves();
                if (allSaves.length > 0) {
                    const fetchedGenre = allSaves[0].worldSettings.genre || 'default';
                    const quotes = GENRE_QUOTES[fetchedGenre] || GENRE_QUOTES.default;
                    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                    setDynamicTitle(randomQuote);
                    setLastGenre(fetchedGenre);
                } else {
                    setDynamicTitle(GENRE_QUOTES.default[0]);
                    setLastGenre('default');
                }
            } catch (e) {
                console.warn("Không thể tải các tệp lưu để xác định tiêu đề động:", e);
                setDynamicTitle(GENRE_QUOTES.default[0]);
                setLastGenre('default');
            }
        };

        fetchLastGenreAndSetTitle();
    }, []);
    
    return (
        <div className="main-menu-container" data-genre-theme={sanitizeTextForClassName(lastGenre)}>
            <h1 className="main-menu-title" id="menu-title">
                {dynamicTitle}
            </h1>
            <nav className="main-menu-nav" aria-label="Main Menu">
                <button className="main-menu-button" onClick={() => onNavigate('create')} style={{'--i': 1} as React.CSSProperties}>Tạo Thế Giới Mới</button>
                <button className="main-menu-button" onClick={() => onNavigate('load')} style={{'--i': 2} as React.CSSProperties}>Quản Lý & Tải Game</button>
                <button className="main-menu-button" onClick={onOpenSettingsModal} style={{'--i': 3} as React.CSSProperties}>Cài Đặt</button>
                <button className="main-menu-button" onClick={onOpenApiKeyModal} style={{'--i': 4} as React.CSSProperties}>Thiết Lập API Key</button>
                <button className="main-menu-button" onClick={onOpenChangelogModal} style={{'--i': 5} as React.CSSProperties}>Cập Nhật</button>
            </nav>
            <div role="status" className="main-menu-api-status">{apiStatus}</div>
        </div>
    );
};