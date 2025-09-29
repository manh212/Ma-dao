/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { CHANGELOG_DATA } from '../../constants/changelogConstants';
import type { ChangelogEntry } from '../../constants/changelogConstants';

interface ChangelogModalProps {
  onClose: () => void;
}

const typeLabels: Record<ChangelogEntry['changes'][0]['type'], string> = {
  new: 'MỚI',
  improvement: 'CẢI TIẾN',
  fix: 'SỬA LỖI',
  update: 'CẬP NHẬT',
};

const typeClasses: Record<ChangelogEntry['changes'][0]['type'], string> = {
  new: 'new',
  improvement: 'improvement',
  fix: 'fix',
  update: 'update',
};

export const ChangelogModal = ({ onClose }: ChangelogModalProps) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content changelog-modal-content" onClick={e => e.stopPropagation()}>
      <header className="modal-header">
        <h3>Nhật Ký Cập Nhật</h3>
        <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
      </header>
      <div className="modal-body">
        {CHANGELOG_DATA.map(entry => (
          <section key={entry.version} className="changelog-entry">
            <header className="changelog-entry-header">
              <h2>{entry.version}</h2>
              <span>{entry.date}</span>
            </header>
            <ul className="changelog-list">
              {entry.changes.map((change, index) => (
                <li key={index} className="changelog-item">
                  <span className={`change-type ${typeClasses[change.type]}`}>{typeLabels[change.type]}</span>
                  <p className="change-description">{change.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </div>
);