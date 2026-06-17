import { useState } from 'react';
import { employees } from '../../data/employees';
import { useGame } from '../../context/GameContext';
import type { Employee, EmployeeStatus } from '../../types';

// ============================================================
// 조직 현황 패널 — 조직도 + 직원 현황
// ============================================================

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  active:    '재직',
  inactive:  '퇴직',
  on_leave:  '휴직',
  suspended: '직무정지',
  unknown:   '불명',
};

const DEPT_GROUPS = [
  { name: '현무과', func: '봉인·봉쇄',   teams: ['현무1팀', '현무2팀'] },
  { name: '백호과', func: '조사·문서화', teams: ['백호1팀', '백호2팀'] },
  { name: '청룡과', func: '구조',         teams: ['청룡1팀', '청룡2팀'] },
  { name: '주작과', func: '현장수습',     teams: ['주작1팀'] },
] as const;

type Tab = 'chart' | 'list';

export function PersonnelPanel() {
  const { isVisible } = useGame();
  const [tab, setTab]               = useState<Tab>('chart');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedEmp, setSelectedEmp]   = useState<Employee | null>(null);

  const visible = employees.filter(isVisible);

  function teamCount(teamName: string) {
    return visible.filter(e => e.department === teamName && e.status === 'active').length;
  }

  function teamMembers(teamName: string) {
    return visible.filter(e => e.department === teamName);
  }

  function handleSelectTeam(team: string) {
    setSelectedTeam(prev => prev === team ? null : team);
  }

  /* ── 직원 상세 뷰 ────────────────────────────────────────── */
  if (selectedEmp) {
    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">조직 현황 — 직원 상세</span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={() => setSelectedEmp(null)}>◀ 목록으로</button>
        </div>
        <div className="detail-body">
          <div className="det-subtitle" style={{ fontFamily: 'var(--mono)' }}>사번 {selectedEmp.employeeId}</div>
          <div className="det-title">{selectedEmp.name}</div>

          <div className="det-section-title">기본 정보</div>
          <div className="det-meta">
            <span className="det-meta__lbl">재직 상태</span>
            <span className="det-meta__val">
              <span className={`badge badge--${selectedEmp.status}`}>{STATUS_LABEL[selectedEmp.status]}</span>
            </span>
            <span className="det-meta__lbl">소속</span>
            <span className="det-meta__val">{selectedEmp.department}</span>
            <span className="det-meta__lbl">직위</span>
            <span className="det-meta__val">{selectedEmp.position}</span>
            <span className="det-meta__lbl">직급</span>
            <span className="det-meta__val">{selectedEmp.rank}</span>
            {selectedEmp.joinDate && (
              <>
                <span className="det-meta__lbl">임용일</span>
                <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
                  {selectedEmp.joinDate.replace(/-/g, '.')}
                </span>
              </>
            )}
          </div>

          {(selectedEmp.phone || selectedEmp.email) && (
            <>
              <div className="det-section-title">연락처</div>
              <div className="det-meta">
                {selectedEmp.phone && (
                  <>
                    <span className="det-meta__lbl">전화</span>
                    <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>{selectedEmp.phone}</span>
                  </>
                )}
                {selectedEmp.email && (
                  <>
                    <span className="det-meta__lbl">이메일</span>
                    <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>{selectedEmp.email}</span>
                  </>
                )}
              </div>
            </>
          )}

          {selectedEmp.notes && (
            <>
              <div className="det-section-title">특이사항</div>
              <div className="det-notes">{selectedEmp.notes}</div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── 메인 패널 ──────────────────────────────────────────── */
  return (
    <div className="panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">조직 현황</span>
        <span className="sec-hd__info">재직 {visible.filter(e => e.status === 'active').length}명</span>
      </div>

      {/* 탭 */}
      <div className="org-tabs">
        <button
          className={`org-tab${tab === 'chart' ? ' org-tab--active' : ''}`}
          onClick={() => setTab('chart')}
        >
          조직도
        </button>
        <button
          className={`org-tab${tab === 'list' ? ' org-tab--active' : ''}`}
          onClick={() => { setTab('list'); setSelectedTeam(null); }}
        >
          직원 현황
        </button>
      </div>

      {/* ── 조직도 탭 ────────────────────────────────────── */}
      {tab === 'chart' && (
        <div className="org-chart">
          {/* 기관명 루트 */}
          <div className="org-chart__root-row">
            <div className="org-node org-node--root">
              <span className="org-node__name">초자연재난관리국</span>
              <span className="org-node__sub">세광특별시 지부</span>
            </div>
          </div>

          {/* 루트 → 부서 연결선 */}
          <div className="org-chart__vline" />

          {/* 부서 행 */}
          <div className="org-chart__dept-row">
            {DEPT_GROUPS.map(dept => (
              <div key={dept.name} className="org-chart__dept-col">
                <div className="org-node org-node--dept">
                  <span className="org-node__name">{dept.name}</span>
                  <span className="org-node__sub">{dept.func}</span>
                </div>

                {/* 팀 열 */}
                <div className="org-chart__team-col">
                  {dept.teams.map(team => {
                    const count = teamCount(team);
                    const isActive = selectedTeam === team;
                    return (
                      <div key={team} className="org-chart__team-wrap">
                        <div
                          className={`org-node org-node--team${isActive ? ' org-node--team-sel' : ''}`}
                          onClick={() => handleSelectTeam(team)}
                        >
                          <span className="org-node__name">{team}</span>
                          <span className="org-node__sub">재직 {count}명</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 선택 팀 구성원 */}
          {selectedTeam && (
            <div className="org-team-detail">
              <div className="org-team-detail__hd">
                <span className="org-team-detail__name">{selectedTeam}</span>
                <span className="org-team-detail__count">총 {teamMembers(selectedTeam).length}명</span>
              </div>
              <table className="tbl">
                <colgroup>
                  <col />
                  <col style={{ width: 80 }} />
                  <col style={{ width: 60 }} />
                  <col style={{ width: 80 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingLeft: 10 }}>성명</th>
                    <th>직위</th>
                    <th>직급</th>
                    <th>재직 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers(selectedTeam).map(emp => (
                    <tr key={emp.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEmp(emp)}>
                      <td style={{ paddingLeft: 10, fontWeight: 600 }}>{emp.name}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{emp.position}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{emp.rank}</td>
                      <td className="tbl-col-stat">
                        <span className={`badge badge--${emp.status}`}>{STATUS_LABEL[emp.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 직원 현황 탭 ─────────────────────────────────── */}
      {tab === 'list' && (
        <div className="org-list">
          {DEPT_GROUPS.map(dept => {
            const deptMembers = dept.teams.flatMap(teamMembers);
            if (deptMembers.length === 0) return null;
            return (
              <div key={dept.name} className="org-list__dept">
                <div className="org-list__dept-hd">
                  {dept.name}
                  <span className="org-list__dept-func">{dept.func}</span>
                </div>
                {dept.teams.map(team => {
                  const members = teamMembers(team);
                  if (members.length === 0) return null;
                  return (
                    <div key={team} className="org-list__team">
                      <div className="org-list__team-hd">{team}</div>
                      <table className="tbl">
                        <colgroup>
                          <col />
                          <col style={{ width: 130 }} />
                          <col style={{ width: 80 }} />
                          <col style={{ width: 60 }} />
                          <col style={{ width: 80 }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', paddingLeft: 10 }}>성명</th>
                            <th>사번</th>
                            <th>직위</th>
                            <th>직급</th>
                            <th>재직 상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map(emp => (
                            <tr
                              key={emp.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedEmp(emp)}
                            >
                              <td style={{ paddingLeft: 10, fontWeight: 600 }}>{emp.name}</td>
                              <td style={{ fontFamily: 'var(--mono)', fontSize: 11, textAlign: 'center', color: 'var(--text-3)' }}>
                                {emp.employeeId}
                              </td>
                              <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{emp.position}</td>
                              <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{emp.rank}</td>
                              <td className="tbl-col-stat">
                                <span className={`badge badge--${emp.status}`}>{STATUS_LABEL[emp.status]}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
