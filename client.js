window.__ModuleLoader__.load({
  id: '@local/session-switcher',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    /* Frame overlay entry: double Shift opens the session palette. */
    const PLUGIN_ID = '@local/session-switcher'
    const NS = 'session-switcher'
    /** Two Shift presses closer than this open the palette. */
    const DOUBLE_SHIFT_MS = 420

    const zh = {
      'meta.title': '会话切换',
      'meta.description': '双击 Shift 在窗口中间打开可搜索的会话面板，按工作区分组，支持键盘导航与快速切换；同时解除内置 Ctrl+K 会话搜索快捷键的绑定。',
      'title': '会话切换',
      'placeholder': '搜索会话或工作区',
      'clear': '清除搜索',
      'current': '当前',
      'group.workspace.default': '默认工作区',
      'group.ungrouped': '未分组',
      'session.new': '新会话',
      'session.untitled': '未命名会话',
      'empty.noMatches': '没有匹配的会话',
      'empty.none': '还没有会话',
      'empty.hint': '双击 Shift 随时打开',
      'state.loading': '正在加载会话…',
      'hint.nav': '上下导航',
      'hint.open': '打开',
      'hint.close': '关闭',
      'hint.total': '共 {n} 个会话',
      'time.now': '刚刚',
      'time.minutes': '{n} 分钟前',
      'time.hours': '{n} 小时前',
      'time.days': '{n} 天前',
      'time.months': '{n} 个月前',
      'time.years': '{n} 年前',
    }

    const en = {
      'meta.title': 'Session Switcher',
      'meta.description': 'Press Shift twice to open a searchable session palette in the center of the window, grouped by workspace and operable from the keyboard. It also releases the built-in Ctrl+K session-search binding.',
      'title': 'Switch session',
      'placeholder': 'Search sessions or workspaces',
      'clear': 'Clear search',
      'current': 'Current',
      'group.workspace.default': 'Default workspace',
      'group.ungrouped': 'Ungrouped',
      'session.new': 'New session',
      'session.untitled': 'Untitled session',
      'empty.noMatches': 'No matching sessions',
      'empty.none': 'No sessions yet',
      'empty.hint': 'Press Shift twice to open',
      'state.loading': 'Loading sessions…',
      'hint.nav': 'to navigate',
      'hint.open': 'to open',
      'hint.close': 'to close',
      'hint.total': '{n} sessions',
      'time.now': 'now',
      'time.minutes': '{n}m ago',
      'time.hours': '{n}h ago',
      'time.days': '{n}d ago',
      'time.months': '{n}mo ago',
      'time.years': '{n}y ago',
    }

    const CSS = `
.dssw-root {
  --dssw-accent: var(--dsw-alias-state-business-primary, var(--dsw-alias-link, #4176e6));
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
  padding: var(--dsh-frame-overlay-top, 24px) 24px 24px;
  background: color-mix(in srgb, var(--dsw-alias-bg-mask-1) 72%, transparent);
  animation: dssw-fade 120ms ease-out;
}
.dssw-panel {
  position: relative;
  width: min(660px, 100%);
  max-height: min(72vh, 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid color-mix(in srgb, var(--dssw-accent) 26%, transparent);
  border-radius: 16px;
  box-shadow:
    0 26px 64px -16px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 70%, transparent),
    0 3px 12px color-mix(in srgb, var(--dsw-alias-bg-mask-2) 85%, transparent);
  animation: dssw-pop 160ms ease-out;
}
.dssw-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    color-mix(in srgb, var(--dssw-accent) 85%, transparent) 30%,
    color-mix(in srgb, var(--dssw-accent) 85%, transparent) 70%,
    transparent 100%);
  opacity: 0.55;
  pointer-events: none;
}
@keyframes dssw-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dssw-pop {
  from { opacity: 0; transform: translateY(-8px) scale(0.99); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .dssw-root, .dssw-panel { animation: none; }
}

.dssw-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
  padding: 9px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
}
.dssw-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  height: 38px;
  box-sizing: border-box;
  padding: 0 10px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l3);
}
.dssw-field:focus-within {
  border-color: color-mix(in srgb, var(--dssw-accent) 55%, var(--dsw-alias-border-l3));
}
.dssw-search-icon {
  display: inline-flex;
  flex: none;
  color: var(--dsw-alias-label-secondary);
}
.dssw-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 14px;
  line-height: 20px;
}
.dssw-input::placeholder {
  color: var(--dsw-alias-label-secondary);
  opacity: 0.85;
}
.dssw-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.dssw-clear:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dssw-clear:focus-visible,
.dssw-session:focus-visible {
  outline: 2px solid var(--dssw-accent);
  outline-offset: -2px;
}
.dssw-esc {
  display: inline-flex;
  flex: none;
  align-items: center;
}

.dssw-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px 8px 10px;
  scrollbar-width: thin;
}
.dssw-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-top: 4px;
}
.dssw-group:first-child {
  padding-top: 0;
}
.dssw-group-header {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  user-select: none;
}
.dssw-group-icon {
  display: inline-flex;
  flex: none;
  color: var(--dsw-alias-label-secondary);
  opacity: 0.9;
}
.dssw-group-title {
  flex: none;
  max-width: 42%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  font-weight: 600;
}
.dssw-group-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 400;
  opacity: 0.75;
}
.dssw-group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);
  font-size: 10.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.dssw-session {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 10px 0 8px;
  border-radius: 8px;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  user-select: none;
}
.dssw-session:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dssw-session.is-active {
  background: color-mix(in srgb, var(--dssw-accent) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--dssw-accent);
}
.dssw-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 14px;
  height: 14px;
}
.dssw-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
}
.dssw-dot.is-pending {
  background: var(--dsw-alias-state-warn-primary);
}
.dssw-dot.is-done {
  background: var(--dsw-alias-state-success-primary);
}
.dssw-spinner {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: var(--dsw-alias-label-tertiary);
}
.dssw-spinner svg {
  display: block;
  width: 100%;
  height: 100%;
}
.dssw-spinner-motion {
  transform-origin: center;
  animation: dssw-spin 1.5s linear infinite;
}
.dssw-spinner circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}
.dssw-spinner .is-track {
  opacity: 0.25;
}
.dssw-spinner .is-arc {
  stroke-dasharray: 12 150;
  animation: dssw-dash 1.5s ease-in-out infinite;
}
@keyframes dssw-spin {
  to { transform: rotate(360deg); }
}
@keyframes dssw-dash {
  0% { stroke-dasharray: 12 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 24 150; stroke-dashoffset: -6; }
  to { stroke-dasharray: 12 150; stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dssw-spinner-motion, .dssw-spinner .is-arc { animation: none; }
  .dssw-spinner .is-arc { stroke-dasharray: 18 150; stroke-dashoffset: -3; }
}
.dssw-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.dssw-session-title {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 18px;
}
.dssw-session.is-current .dssw-session-title {
  font-weight: 600;
}
.dssw-current {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dssw-accent) 20%, transparent);
  color: var(--dsw-alias-label-primary);
  font-size: 10px;
  font-weight: 600;
  line-height: 14px;
  white-space: nowrap;
}
.dssw-time {
  flex: none;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  line-height: 14px;
  font-variant-numeric: tabular-nums;
}

.dssw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 42px 16px;
  text-align: center;
  color: var(--dsw-alias-label-secondary);
}
.dssw-empty-icon {
  display: inline-flex;
  opacity: 0.65;
}
.dssw-empty-title {
  color: var(--dsw-alias-label-primary);
  font-size: 12.5px;
}
.dssw-empty-hint {
  font-size: 11px;
  opacity: 0.8;
}

.dssw-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: none;
  height: 34px;
  padding: 0 12px;
  border-top: 1px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dssw-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.dssw-keys {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.dssw-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l2);
  border-bottom-color: color-mix(in srgb, var(--dssw-accent) 30%, var(--dsw-alias-border-l4));
  border-radius: 5px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 1;
}
.dssw-footer .dssw-kbd {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
}
.dssw-total {
  margin-left: auto;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
`

    function iconFrame(size, children) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.35,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        children,
      )
    }

    function SearchGlyph({ size = 16 }) {
      return iconFrame(size, [
        h('circle', { key: 'circle', cx: 7, cy: 7, r: 4.25 }),
        h('path', { key: 'handle', d: 'M10.2 10.2 13.4 13.4' }),
      ])
    }

    function FolderGlyph({ size = 14 }) {
      return iconFrame(
        size,
        h('path', {
          d: 'M1.9 4.5c0-.7.55-1.25 1.25-1.25h3.1l1.3 1.45h5.25c.7 0 1.25.55 1.25 1.25v5.55c0 .7-.55 1.25-1.25 1.25H3.15c-.7 0-1.25-.55-1.25-1.25V4.5Z',
        }),
      )
    }

    function CloseGlyph({ size = 12 }) {
      return iconFrame(size, [
        h('path', { key: 'a', d: 'M4.5 4.5 11.5 11.5' }),
        h('path', { key: 'b', d: 'M11.5 4.5 4.5 11.5' }),
      ])
    }

    /** Running indicator: the same indeterminate spinner the host uses for `ongoing`. */
    function StateSpinner() {
      return h(
        'span',
        { className: 'dssw-spinner', 'aria-hidden': 'true' },
        h(
          'svg',
          { viewBox: '0 0 24 24', width: 12, height: 12, focusable: 'false' },
          h('g', { className: 'dssw-spinner-motion' }, [
            h('circle', { key: 'track', className: 'is-track', cx: 12, cy: 12, r: 9.5 }),
            h('circle', { key: 'arc', className: 'is-arc', cx: 12, cy: 12, r: 9.5 }),
          ]),
        ),
      )
    }

    function Kbd({ children }) {
      return h('kbd', { className: 'dssw-kbd' }, children)
    }

    /** Relative timestamp in the active locale's short form. */
    function relativeLabel(updatedAt, now, t) {
      if (!updatedAt) return ''
      const diff = Math.max(0, now - updatedAt)
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour
      if (diff < minute) return t('time.now')
      if (diff < hour) return t('time.minutes', { n: Math.floor(diff / minute) })
      if (diff < day) return t('time.hours', { n: Math.floor(diff / hour) })
      if (diff < 30 * day) return t('time.days', { n: Math.floor(diff / day) })
      if (diff < 365 * day) return t('time.months', { n: Math.floor(diff / (30 * day)) })
      return t('time.years', { n: Math.floor(diff / (365 * day)) })
    }

    function statusOf(statuses, sessionId) {
      if (!statuses) return undefined
      if (typeof statuses.get === 'function') return statuses.get(sessionId)
      return statuses[sessionId]
    }

    /** Count running child Sessions exactly like the sidebar's status projection. */
    function runningSubagentCount(list, parentId, statuses) {
      const byId = (list && list.byId) || {}
      const projections = list && list.projectionsBySession
      const values = projections && projections[parentId] ? projections[parentId].values : undefined
      const catalog = values ? values.subagentCatalog : undefined
      if (!Array.isArray(catalog)) return 0
      let count = 0
      for (const child of catalog) {
        if (!child || !child.id) continue
        const childStatus = statusOf(statuses, child.id)
        const running =
          childStatus && childStatus.running !== undefined
            ? childStatus.running
            : Boolean(byId[child.id] && byId[child.id].running)
        if (running) count += 1
      }
      return count
    }

    function sessionTitle(row, t) {
      if (row.blank) return t('session.new')
      const title = typeof row.title === 'string' ? row.title.trim() : ''
      return title === '' ? t('session.untitled') : title
    }

    function workspaceTitle(workspace, t) {
      const stored = typeof workspace.title === 'string' ? workspace.title.trim() : ''
      if (stored === 'default-workspace') return t('group.workspace.default')
      if (stored !== '') return stored
      const path = typeof workspace.path === 'string' ? workspace.path : ''
      const parts = path.split(/[\\/]+/).filter(Boolean)
      return parts.length > 0 ? parts[parts.length - 1] : t('group.ungrouped')
    }

    const SEARCH_SHORTCUT_ID = 'session.search'

    /** Whether a normalized binding is exactly the palette's Ctrl/Cmd+K chord. */
    function isPaletteChord(binding) {
      if (!binding || binding.code !== 'KeyK' || binding.secondCode !== undefined) return false
      const modifiers = Array.isArray(binding.modifiers) ? binding.modifiers : []
      return modifiers.length === 1 && (modifiers[0] === 'control' || modifiers[0] === 'meta')
    }

    /**
     * Free Ctrl/Cmd+K for the palette. The Desktop keyboard bridge resolves the
     * built-in "search sessions" chord outside the DOM, so a keydown listener
     * cannot preempt it; clearing that one binding is the supported way. The
     * override is durable (Settings -> General -> Keyboard shortcuts restores
     * it) and the sidebar search button keeps working; only the chord changes.
     */
    function releaseSearchShortcut(ctx) {
      ctx.inject(['shortcuts'], (scope) => {
        const shortcuts = scope.shortcuts
        if (!shortcuts || typeof shortcuts.edit !== 'function') return
        if (!shortcuts.config || typeof shortcuts.config.getSnapshot !== 'function') return
        if (!shortcuts.catalog || typeof shortcuts.catalog.getSnapshot !== 'function') return

        let settled = false
        let running = false
        let disposed = false
        let attempts = 0
        let timer = 0

        const rowOf = () => {
          const rows = shortcuts.catalog.getSnapshot()
          return Array.isArray(rows) ? rows.find((row) => row.id === SEARCH_SHORTCUT_ID) : undefined
        }

        const schedule = (delay) => {
          if (disposed || attempts >= 5) return
          if (timer) window.clearTimeout(timer)
          timer = window.setTimeout(attempt, delay)
        }

        const attempt = () => {
          if (disposed || settled || running) return
          const config = shortcuts.config.getSnapshot()
          if (!config || config.status === 'loading') return
          const row = rowOf()
          if (!row) return
          if (row.binding === null || !isPaletteChord(row.binding)) {
            settled = true
            return
          }
          attempts += 1
          running = true
          Promise.resolve()
            .then(() => shortcuts.edit({ type: 'set', id: SEARCH_SHORTCUT_ID, binding: null }, config.revision))
            .then(
            (result) => {
              running = false
              if (disposed || !result) {
                settled = true
                return
              }
              if (result.status === 'saved') {
                settled = true
                return
              }
              if (result.status === 'stale' || result.status === 'not-ready') {
                schedule(180)
                return
              }
              settled = true
            },
            () => {
              running = false
              settled = true
            },
          )
        }

        scope.effect(() => {
          const offConfig = shortcuts.config.subscribe(attempt)
          const offCatalog = shortcuts.catalog.subscribe(attempt)
          schedule(0)
          return () => {
            disposed = true
            if (timer) window.clearTimeout(timer)
            offConfig()
            offCatalog()
          }
        }, 'session-switcher: release Ctrl+K from the built-in search shortcut')
      })
    }

    /** Build the two-level list, the filter, and the keyboard walk order from live snapshots. */
    function buildModel({ ws, list, statuses, query, panelActive, now, t }) {
      const workspaces = Array.isArray(ws && ws.items) ? ws.items : []
      const byId = (list && list.byId) || {}
      const ids = Array.isArray(list && list.ids) ? list.ids : Object.keys(byId)
      const archived = new Set(Array.isArray(ws && ws.archivedSessionIds) ? ws.archivedSessionIds : [])
      const needle = query.trim().toLowerCase()
      const mainRow = Object.values(byId).find(
        (row) => row && ((row.retainedBy && row.retainedBy.mainView) || 0) > 0,
      )
      const mainId = mainRow === undefined ? undefined : mainRow.id
      const currentId = panelActive ? undefined : mainId
      /**
       * Mirror the sidebar's membership rule: subagent children never appear,
       * and among blank Sessions only the selected provisional New Session is
       * shown. Archived Sessions stay hidden too.
       */
      const isVisible = (row) => {
        if (row.origin === 'subagent') return false
        if (row.blank && row.id !== mainId) return false
        return !archived.has(row.id)
      }

      const decorate = (row) => {
        const status = statusOf(statuses, row.id)
        const pendingKind =
          status && status.pendingInteraction ? status.pendingInteraction.kind : undefined
        const pending =
          pendingKind === 'approval' || pendingKind === 'plan-review' || pendingKind === 'question'
        const running =
          status && status.running !== undefined ? status.running : row.running === true
        const completed = status ? status.completionUnread === true : false
        const childrenRunning = runningSubagentCount(list, row.id, statuses) > 0
        const state = pending
          ? 'pending'
          : running
            ? 'running'
            : childrenRunning
              ? 'running'
              : completed
                ? 'done'
                : 'none'
        return {
          id: row.id,
          title: sessionTitle(row, t),
          updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : 0,
          current: row.id === currentId,
          statusState: state,
          timeLabel: relativeLabel(row.updatedAt, now, t),
        }
      }

      const groups = []
      const accounted = new Set()

      for (const workspace of workspaces) {
        const memberIds = Array.isArray(workspace.sessionIds) ? workspace.sessionIds : []
        for (const id of memberIds) accounted.add(id)
        const title = workspaceTitle(workspace, t)
        const path = typeof workspace.path === 'string' ? workspace.path : ''
        const headerMatch =
          needle !== '' &&
          (title.toLowerCase().includes(needle) || path.toLowerCase().includes(needle))
        const rows = []
        for (const id of memberIds) {
          const row = byId[id]
          if (!row || !isVisible(row)) continue
          const rowTitle = sessionTitle(row, t)
          if (needle !== '' && !headerMatch && !rowTitle.toLowerCase().includes(needle)) continue
          rows.push(decorate(row))
        }
        if (rows.length === 0) continue
        rows.sort((a, b) => b.updatedAt - a.updatedAt)
        groups.push({
          key: `workspace:${String(workspace.workspaceId)}`,
          title,
          path,
          rows,
        })
      }

      const ungrouped = []
      for (const id of ids) {
        if (accounted.has(id)) continue
        const row = byId[id]
        if (!row || !isVisible(row)) continue
        const rowTitle = sessionTitle(row, t)
        if (needle !== '' && !rowTitle.toLowerCase().includes(needle)) continue
        ungrouped.push(decorate(row))
      }
      if (ungrouped.length > 0) {
        ungrouped.sort((a, b) => b.updatedAt - a.updatedAt)
        groups.push({
          key: 'ungrouped',
          title: t('group.ungrouped'),
          path: '',
          rows: ungrouped,
        })
      }

      const indexById = {}
      let total = 0
      for (const group of groups) {
        for (const row of group.rows) {
          indexById[row.id] = total
          total += 1
        }
      }

      return {
        groups,
        visibleIds: groups.flatMap((group) => group.rows.map((row) => row.id)),
        indexById,
        total,
        currentId,
        loading: (list && list.phase ? list.phase : 'pending') !== 'ready',
      }
    }

    function SessionSwitcher(props) {
      const { openSession, useWorkspaces, useSessions, useSessionStatus, usePanelInfo } = props
      const t = typeof props.t === 'function' ? props.t : (key) => key

      const [open, setOpen] = useState(false)
      const [query, setQuery] = useState('')
      const [activeId, setActiveId] = useState(null)
      const [now, setNow] = useState(() => Date.now())
      const inputRef = useRef(null)
      const listRef = useRef(null)
      const rowRefs = useRef(new Map())
      const previousFocusRef = useRef(null)
      const openRef = useRef(false)
      const skipScrollRef = useRef(false)

      const wsSnapshot = useWorkspaces((state) => state)
      const list = useSessions((state) => state)
      const statuses = useSessionStatus((state) => state)
      const panelActive = usePanelInfo(
        (info) => info.activePanelId !== null && info.activePanelId !== undefined,
      )

      const model = useMemo(
        () => buildModel({ ws: wsSnapshot, list, statuses, query, panelActive, now, t }),
        [wsSnapshot, list, statuses, query, panelActive, now, t],
      )
      const { groups, visibleIds, indexById, total, loading } = model

      useEffect(() => {
        openRef.current = open
      }, [open])

      const close = useCallback(() => {
        setOpen(false)
        setQuery('')
      }, [])

      const choose = useCallback(
        (sessionId) => {
          if (sessionId === null || sessionId === undefined) return
          setOpen(false)
          setQuery('')
          try {
            openSession(sessionId)
          } catch (error) {
            console.warn('session-switcher: could not open session', error)
          }
        },
        [openSession],
      )

      const move = useCallback(
        (delta) => {
          if (visibleIds.length === 0) return
          const at = activeId === null ? -1 : visibleIds.indexOf(activeId)
          const next =
            at === -1
              ? delta > 0
                ? 0
                : visibleIds.length - 1
              : (at + delta + visibleIds.length) % visibleIds.length
          setActiveId(visibleIds[next])
        },
        [activeId, visibleIds],
      )

      /* Double Shift: two distinct Shift presses in quick succession. Any other key cancels. */
      useEffect(() => {
        let lastShift = 0
        const onKeyDown = (event) => {
          if (event.key !== 'Shift') {
            lastShift = 0
            return
          }
          if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
            lastShift = 0
            return
          }
          const at = typeof performance !== 'undefined' ? performance.now() : Date.now()
          if (lastShift !== 0 && at - lastShift <= DOUBLE_SHIFT_MS) {
            lastShift = 0
            if (!openRef.current) {
              event.preventDefault()
              setQuery('')
              setOpen(true)
            }
            return
          }
          lastShift = at
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
      }, [])

      /* Reset the draft and hand focus to the search field while the palette is open. */
      useEffect(() => {
        if (!open) return undefined
        setQuery('')
        setNow(Date.now())
        /* Every open starts at the top of the list with the first row selected. */
        skipScrollRef.current = true
        setActiveId(visibleIds.length > 0 ? visibleIds[0] : null)
        const listBody = listRef.current
        if (listBody) listBody.scrollTop = 0
        previousFocusRef.current = typeof document !== 'undefined' ? document.activeElement : null
        const frame =
          typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame(() => {
                const input = inputRef.current
                if (!input) return
                input.focus({ preventScroll: true })
                input.select()
              })
            : 0
        return () => {
          if (frame) cancelAnimationFrame(frame)
          const target = previousFocusRef.current
          previousFocusRef.current = null
          if (target && target !== document.body && target.isConnected && typeof target.focus === 'function') {
            try {
              target.focus({ preventScroll: true })
            } catch (_error) {
              try {
                target.focus()
              } catch (_ignored) {
                /* the previous element may have been unmounted */
              }
            }
          }
        }
      }, [open])

      /* Keyboard contract: Ctrl/⌘+J and Ctrl/⌘+K step, Enter opens, Escape clears or closes. */
      useEffect(() => {
        if (!open) return undefined
        const onKeyDown = (event) => {
          if (event.isComposing) return
          const key = event.key
          const modified = event.ctrlKey || event.metaKey
          if (key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            if (query !== '') {
              setQuery('')
              return
            }
            setOpen(false)
            return
          }
          if (key === 'Tab') {
            event.preventDefault()
            event.stopPropagation()
            if (inputRef.current) inputRef.current.focus({ preventScroll: true })
            return
          }
          if (key === 'Enter') {
            if (activeId !== null) {
              event.preventDefault()
              event.stopPropagation()
              choose(activeId)
            }
            return
          }
          if (key === 'ArrowDown' || (modified && (key === 'j' || key === 'J'))) {
            event.preventDefault()
            event.stopPropagation()
            move(1)
            return
          }
          if (key === 'ArrowUp' || (modified && (key === 'k' || key === 'K'))) {
            event.preventDefault()
            event.stopPropagation()
            move(-1)
          }
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
      }, [open, query, activeId, choose, move])

      /* Keep a valid highlight; a filtered list falls back to its first row. */
      useEffect(() => {
        if (!open) return
        if (activeId !== null && visibleIds.indexOf(activeId) !== -1) return
        setActiveId(visibleIds.length > 0 ? visibleIds[0] : null)
      }, [open, activeId, visibleIds])

      /* Keep the highlighted row inside the viewport; the open reset owns the first frame. */
      useEffect(() => {
        if (!open) return
        const skip = skipScrollRef.current
        skipScrollRef.current = false
        if (skip || activeId === null) return
        const element = rowRefs.current.get(activeId)
        if (element) element.scrollIntoView({ block: 'nearest' })
      }, [open, activeId, visibleIds])

      if (!open) return null

      const activeIndex = activeId === null ? undefined : indexById[activeId]
      const activeDescendant = activeIndex === undefined ? undefined : `dssw-option-${String(activeIndex)}`

      const renderRow = (row) => {
        const index = indexById[row.id]
        return h(
          'div',
          {
            key: row.id,
            id: index === undefined ? undefined : `dssw-option-${String(index)}`,
            ref: (element) => {
              if (element) rowRefs.current.set(row.id, element)
              else rowRefs.current.delete(row.id)
            },
            className:
              'dssw-session' +
              (row.id === activeId ? ' is-active' : '') +
              (row.current ? ' is-current' : ''),
            role: 'option',
            'aria-selected': row.id === activeId,
            title: row.title,
            onMouseDown: (event) => event.preventDefault(),
            onMouseEnter: () => {
              if (activeId !== row.id) setActiveId(row.id)
            },
            onClick: () => choose(row.id),
          },
          [
            h(
              'span',
              { key: 'state', className: 'dssw-state' },
              row.statusState === 'running'
                ? h(StateSpinner)
                : row.statusState === 'none'
                  ? null
                  : h('span', { className: `dssw-dot is-${row.statusState}` }),
            ),
            h('span', { key: 'heading', className: 'dssw-heading' }, [
              h('span', { key: 'title', className: 'dssw-session-title' }, row.title),
              row.current
                ? h('span', { key: 'current', className: 'dssw-current' }, t('current'))
                : null,
            ]),
            row.timeLabel ? h('span', { key: 'time', className: 'dssw-time' }, row.timeLabel) : null,
          ],
        )
      }

      const body = []
      if (groups.length === 0) {
        body.push(
          h('div', { key: 'empty', className: 'dssw-empty' }, [
            h('span', { key: 'icon', className: 'dssw-empty-icon' }, h(SearchGlyph, { size: 22 })),
            h(
              'div',
              { key: 'title', className: 'dssw-empty-title' },
              loading
                ? t('state.loading')
                : query.trim() !== ''
                  ? t('empty.noMatches')
                  : t('empty.none'),
            ),
            h('div', { key: 'hint', className: 'dssw-empty-hint' }, t('empty.hint')),
          ]),
        )
      } else {
        for (const group of groups) {
          body.push(
            h('div', { key: group.key, className: 'dssw-group', role: 'group', 'aria-label': group.title }, [
              h('div', { key: 'header', className: 'dssw-group-header' }, [
                h('span', { key: 'icon', className: 'dssw-group-icon' }, h(FolderGlyph, { size: 14 })),
                h('span', { key: 'title', className: 'dssw-group-title' }, group.title),
                group.path
                  ? h('span', { key: 'path', className: 'dssw-group-path', title: group.path }, group.path)
                  : null,
                h('span', { key: 'count', className: 'dssw-group-count' }, String(group.rows.length)),
              ]),
              group.rows.map(renderRow),
            ]),
          )
        }
      }

      return h(
        'div',
        {
          className: 'dssw-root',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) close()
          },
        },
        h(
          'div',
          {
            className: 'dssw-panel',
            role: 'dialog',
            'aria-modal': 'false',
            'aria-label': t('title'),
          },
          [
            h('div', { key: 'search', className: 'dssw-search' }, [
              h('div', { key: 'field', className: 'dssw-field' }, [
                h('span', { key: 'icon', className: 'dssw-search-icon' }, h(SearchGlyph, { size: 16 })),
                h('input', {
                  key: 'input',
                  ref: inputRef,
                  className: 'dssw-input',
                  type: 'text',
                  value: query,
                  placeholder: t('placeholder'),
                  autoComplete: 'off',
                  spellCheck: false,
                  role: 'combobox',
                  'aria-expanded': true,
                  'aria-controls': 'dssw-listbox',
                  'aria-autocomplete': 'list',
                  'aria-activedescendant': activeDescendant,
                  'aria-label': t('placeholder'),
                  onChange: (event) => setQuery(event.target.value),
                }),
                query === ''
                  ? null
                  : h(
                      'button',
                      {
                        key: 'clear',
                        type: 'button',
                        className: 'dssw-clear',
                        'aria-label': t('clear'),
                        onClick: () => {
                          setQuery('')
                          if (inputRef.current) inputRef.current.focus({ preventScroll: true })
                        },
                      },
                      h(CloseGlyph, { size: 12 }),
                    ),
              ]),
              h('span', { key: 'esc', className: 'dssw-esc' }, h(Kbd, null, 'Esc')),
            ]),
            h(
              'div',
              {
                key: 'body',
                id: 'dssw-listbox',
                ref: listRef,
                className: 'dssw-body',
                role: 'listbox',
                'aria-label': t('title'),
              },
              body,
            ),
            h('div', { key: 'footer', className: 'dssw-footer' }, [
              h('span', { key: 'nav', className: 'dssw-hint' }, [
                h('span', { key: 'keys', className: 'dssw-keys' }, [
                  h(Kbd, { key: 'j' }, 'Ctrl+J'),
                  h(Kbd, { key: 'k' }, 'Ctrl+K'),
                ]),
                h('span', { key: 'label' }, t('hint.nav')),
              ]),
              h('span', { key: 'open', className: 'dssw-hint' }, [
                h(Kbd, { key: 'enter' }, 'Enter'),
                h('span', { key: 'label' }, t('hint.open')),
              ]),
              h('span', { key: 'close', className: 'dssw-hint' }, [
                h(Kbd, { key: 'esc' }, 'Esc'),
                h('span', { key: 'label' }, t('hint.close')),
              ]),
              h('span', { key: 'total', className: 'dssw-total' }, t('hint.total', { n: total })),
            ]),
          ],
        ),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'session-switcher: dictionaries')

        ctx.effect(() => {
          if (typeof document === 'undefined') return undefined
          const tag = document.createElement('style')
          tag.dataset.plugin = PLUGIN_ID
          tag.dataset.pluginCss = `${PLUGIN_ID}/overlay.css`
          tag.textContent = CSS
          document.head.appendChild(tag)
          return () => tag.remove()
        }, 'session-switcher: styles')

        releaseSearchShortcut(ctx)

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'session-switcher',
              order: 40,
              locale: NS,
              inject: () => ({
                openSession: (sessionId) => {
                  const uiWorkspace = ctx.get('uiWorkspace')
                  if (uiWorkspace && typeof uiWorkspace.openSession === 'function') {
                    uiWorkspace.openSession(sessionId)
                  } else {
                    console.warn('session-switcher: uiWorkspace service is unavailable')
                  }
                },
              }),
            },
            SessionSwitcher,
          ),
        )
      },
    }
  },
})
