/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

export const ACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        description: { type: Type.STRING },
        successChance: { type: Type.INTEGER },
        benefit: { type: Type.STRING },
        risk: { type: Type.STRING },
        timeCost: { type: Type.STRING },
        benefitPotential: { type: Type.INTEGER },
        riskPotential: { type: Type.INTEGER },
        ipCost: { type: Type.INTEGER, description: "Chi phí Điểm Can Thiệp để thực hiện hành động này." },
        isFateAltering: { type: Type.BOOLEAN, description: "True nếu đây là hành động thay đổi vận mệnh." },
    },
    required: ['id', 'description', 'benefit', 'risk', 'benefitPotential', 'riskPotential']
};

export const ACTION_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        successChance: { type: Type.INTEGER },
        benefit: { type: Type.STRING },
        risk: { type: Type.STRING },
        timeCost: { type: Type.STRING },
        benefitPotential: { type: Type.INTEGER },
        riskPotential: { type: Type.INTEGER },
    },
    required: ['successChance', 'benefit', 'risk', 'timeCost', 'benefitPotential', 'riskPotential']
};

export const GAME_TIME_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        year: { type: Type.INTEGER },
        month: { type: Type.INTEGER },
        day: { type: Type.INTEGER },
        hour: { type: Type.INTEGER },
        minute: { type: Type.INTEGER },
        weather: { type: Type.STRING },
    },
    required: ['year', 'month', 'day', 'hour', 'minute', 'weather']
};
