/*******************************************************************************
 * Copyright IBM Corp. 2018
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/

var renderingContext = {};
var parentOrigin = '*';

function updateRenderingContext(event) {
  if (event.data.message === 'updated renderingContext') {
    renderingContext = event.data.renderingContext;
    parentOrigin = event.origin
  }
}

window.addEventListener("message", updateRenderingContext, false);

function requestRenderingContext() {
  window.parent.postMessage({
    message: 'update renderingContext'
  }, parentOrigin );
}

function requestResizeFrame(newHeight) {
  window.parent.postMessage({
    message: 'resize iFrame',
    height: newHeight
  }, parentOrigin );
}

requestRenderingContext();