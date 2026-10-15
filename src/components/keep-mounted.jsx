import * as React from 'react';
import { createPortal } from 'react-dom';

/**
 * Keeps an overlay's body mounted after it closes (Sheet, Dialog, Popover, ...).
 *
 * Radix unmounts closed content. When the body owns state that must survive close / reopen
 * (child components with local state or mount effects, forms, iframes), render the body through
 * this hook instead of as a child of the content:
 *
 *   const keepMounted = useKeepMounted();
 *   <Sheet open={open} onOpenChange={...}>
 *     <SheetContent {...keepMounted.contentProps}>
 *       <SheetHeader>...</SheetHeader>
 *       <div ref={keepMounted.outletRef} className="flex-1 overflow-y-auto px-6" />
 *     </SheetContent>
 *   </Sheet>
 *   {keepMounted.portal(<Body />)}
 *
 * The body mounts the first time the content opens, is moved into a hidden parking node when the
 * content unmounts, and is moved back on the next open. It stays in the same place in the React
 * tree the whole time, so its state and effects are untouched. `contentProps` stops presses /
 * focus inside the body (and inside popups it renders) from counting as "outside" the content.
 */

let parkingNode = null;

function getParkingNode() {
  if (!parkingNode || !parkingNode.isConnected) {
    parkingNode = document.createElement('div');
    parkingNode.hidden = true;
    parkingNode.setAttribute('data-slot', 'keep-mounted-parking');
    document.body.appendChild(parkingNode);
  }
  return parkingNode;
}

// `moveBefore` keeps iframes and focus alive across the move where the browser supports it.
function moveNode(parent, node) {
  if (node.parentNode === parent) return;
  if (typeof parent.moveBefore === 'function' && node.isConnected && parent.isConnected) {
    try {
      parent.moveBefore(node, null);
      return;
    } catch {
      // Fall back to a plain append below.
    }
  }
  parent.appendChild(node);
}

function useKeepMounted() {
  const [node] = React.useState(() => {
    const element = document.createElement('div');
    element.setAttribute('data-slot', 'keep-mounted');
    element.style.display = 'contents';
    return element;
  });
  const [hasOpened, setHasOpened] = React.useState(false);
  // Every press / focus that started inside the body. A set, not a "last event" slot: one
  // event often triggers others before the content checks it (a press moves focus; a focused
  // radio group passes focus on to its item), and those would overwrite a single slot.
  const insideEvents = React.useRef(new WeakSet());

  const outletRef = React.useCallback(
    outlet => {
      if (!outlet) return undefined;
      moveNode(outlet, node);
      setHasOpened(true);
      // Runs before the content's DOM is removed, so the body never leaves the document.
      return () => moveNode(getParkingNode(), node);
    },
    [node]
  );

  React.useEffect(() => () => node.remove(), [node]);

  const contentProps = React.useMemo(() => {
    const keepInside = event => {
      const original = event.detail?.originalEvent;
      if (original && insideEvents.current.has(original)) event.preventDefault();
    };
    return { onPointerDownOutside: keepInside, onFocusOutside: keepInside };
  }, []);

  const markInside = React.useCallback(event => {
    insideEvents.current.add(event.nativeEvent);
  }, []);

  const portal = children =>
    hasOpened
      ? createPortal(
          <div className="contents" onPointerDownCapture={markInside} onFocusCapture={markInside}>
            {children}
          </div>,
          node
        )
      : null;

  return { outletRef, contentProps, portal };
}

export { useKeepMounted };
