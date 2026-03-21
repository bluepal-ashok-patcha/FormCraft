# 🛡️ FORMCRAFT TEST CASE REGISTRY [V1.0]
**Project Phase**: Phase 01 Deployment | **Audit Status**: VERIFIED

---

### 🏛️ EXECUTIVE TEST SUMMARY
| Metric | Count |
| :--- | :--- |
| **Total Test Cases** | 100 |
| **Executed Cases** | 100 |
| **Passed Cases** | 100 |
| **Failed Cases** | 0 |
| **Blocked Cases** | 0 |
| **Success Rate** | 100% |

### 📊 RESULTS BY MODULE
| Module | Total | Passed | Failed |
| :--- | :--- | :--- | :--- |
| **Authentication & Security** | 12 | 12 | 0 |
| **Templates** | 12 | 12 | 0 |
| **Gallery Hub** | 12 | 12 | 0 |
| **Forms** | 18 | 18 | 0 |
| **Submissions** | 10 | 10 | 0 |
| **Responses & Reports** | 15 | 15 | 0 |
| **User Management** | 6 | 6 | 0 |
| **Infrastructure** | 12 | 12 | 0 |
| **Quality Control** | 3 | 3 | 0 |

---

### 🛰️ DETAILED TEST LOG [100 CASES]

| TC ID | Module | Test Case Title | Prerequisites | Steps | Expected Result | Priority | Type | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-001 | Auth | User Registration | System active | 1. Enter details<br>2. Submit | Account created as 'inactive'. OTP sent. | Critical | Func | PASS |
| TC-002 | Auth | Account Verification | User inactive | 1. Enter valid OTP<br>2. Submit | Account activated successfully. | Critical | Sec | PASS |
| TC-003 | Auth | Invalid OTP Attempt | User inactive | 1. Enter wrong OTP<br>2. Submit | Error: "Invalid OTP". | High | Neg | PASS |
| TC-004 | Auth | Expired OTP Attempt | OTP > 5 mins old | 1. Enter expired OTP<br>2. Submit | Error: "OTP has expired". | High | Sec | PASS |
| TC-005 | Security | Login Lockout | User active | 1. Enter 5 wrong passwords | Account blocked for 15 minutes. | Critical | Sec | PASS |
| TC-006 | Security | Blocked Account Check | User locked | 1. Try login within 15m | Access denied message shown. | High | Sec | PASS |
| TC-007 | Security | Reset Password Email | Account exists | 1. Enter email in 'Forgot'<br>2. Submit | OTP sent to email. | High | Func | PASS |
| TC-008 | Security | Lockout Removal | User blocked | 1. Reset password via OTP | Lockout removed. Access restored. | High | Sec | PASS |
| TC-009 | Security | Unverified Account | User inactive | 1. Try login before OTP | Access denied signal shown. | High | Sec | PASS |
| TC-010 | Security | Data Security | User created | 1. Check database | Passwords are encrypted. | High | Sec | PASS |
| TC-011 | Security | Logout Process | User logged in | 1. Click Logout | Session ended successfully. | High | Func | PASS |
| TC-012 | Security | Unauthorized Access | Not logged in | 1. Visit private page | Error: 401 Access denied. | Critical | Sec | PASS |
| TC-013 | Template | Global Template | Admin logged in | 1. Create global template | Visible in global gallery. | Critical | Func | PASS |
| TC-014 | Template | Private Template | Admin logged in | 1. Create template | Only visible to creator. | High | Func | PASS |
| TC-015 | Template | Edit Permission | Card owner | 1. Click edit button | Edit page opens successfully. | High | Func | PASS |
| TC-016 | Template | Permission Check | Card owner | 1. Login as owner | Edit/Delete options visible. | High | Func | PASS |
| TC-017 | Template | Login Sensitivity | Card owner | 1. Login with mixed case | Permission granted successfully. | High | Qual | PASS |
| TC-018 | Template | Promotion Request | Private card | 1. Request Global hub | Request status updated to true. | High | Gov | PASS |
| TC-019 | Template | Cancel Request | Request pending | 1. Click cancel request | Request status removed. | High | Gov | PASS |
| TC-020 | Template | Reject Request | Request pending | 1. Admin rejects request | Template remains private. | High | Gov | PASS |
| TC-021 | Template | Approve Request | Request pending | 1. Admin approves request | Template moved to global hub. | Critical | Gov | PASS |
| TC-022 | Template | Gallery View | Guest user | 1. View gallery | Global templates visible. | High | Func | PASS |
| TC-023 | Template | Template Name | Template use | 1. Name used template | Custom name saved correctly. | Medium | Data | PASS |
| TC-024 | Template | Category Counter | New templates | 1. Check category count | Counter updates correctly. | Low | Data | PASS |
| TC-025 | Gallery | Image Performance | Large gallery | 1. Scroll gallery | Images load quickly. | Medium | Perf | PASS |
| TC-026 | Gallery | Filter Results | Filter selected | 1. Select 'Business' | Only Business cards shown. | Medium | Func | PASS |
| TC-027 | Gallery | Search Results | Title match | 1. Search 'Survey' | Matching results shown. | Medium | Func | PASS |
| TC-028 | Gallery | Empty Search | No results | 1. Search random text | Clear empty state message. | Low | UI | PASS |
| TC-029 | Gallery | Certification Icon | Global template | 1. View card badge | Global mark visible. | Low | UI | PASS |
| TC-030 | Gallery | Hover Actions | Card owner | 1. Move mouse on card | Actions menu visible. | High | UI | PASS |
| TC-031 | Gallery | Admin Visibility | Super Admin | 1. View all templates | Private/Global/Pending visible. | High | Func | PASS |
| TC-032 | Gallery | Category List | API access | 1. Fetch categories | All categories returned. | Low | Data | PASS |
| TC-033 | Gallery | Pagination Check | Multiple pages | 1. Click page 2 | Next results load correctly. | Medium | UI | PASS |
| TC-034 | Gallery | UX Design | User hover | 1. Use hover menu | Clean design response. | Low | UX | PASS |
| TC-035 | Gallery | Zero Case Check | Empty category | 1. Select empty cat | Shows empty state message. | Low | UI | PASS |
| TC-036 | Gallery | Theme System | App layout | 1. View whole app | Consistent layout and colors. | Low | UI | PASS |
| TC-037 | Forms | Form Creation | Template based | 1. Create from template | Form saved correctly. | High | Func | PASS |
| TC-038 | Forms | Form Status | Status toggle | 1. Toggle status | Database updates immediately. | High | Func | PASS |
| TC-039 | Forms | Start Date Timer | Scheduled date | 1. Wait for start date | Status updates automatically. | Medium | Auto | PASS |
| TC-040 | Forms | End Date Timer | Expiry date | 1. Wait for end date | Status updates automatically. | Medium | Auto | PASS |
| TC-041 | Forms | Share Link Hub | Share menu | 1. Copy form link | Link copied successfully. | High | Func | PASS |
| TC-042 | Forms | Public Link Access | Link active | 1. Visit form link | Form loads correctly. | Critical | Func | PASS |
| TC-043 | Forms | Private Link Check | Link inactive | 1. Visit form link | Shows Access Denied. | High | Sec | PASS |
| TC-044 | Forms | Field Accuracy | 5 fields | 1. Check form layout | All fields present and correct. | Medium | UI | PASS |
| TC-045 | Forms | Expired Sub. | After end date | 1. Try to submit | Box blocked correctly. | High | Sec | PASS |
| TC-046 | Forms | Future Access | Before start date | 1. Visit link | Access blocked correctly. | Medium | Func | PASS |
| TC-047 | Forms | Invalid ID Check | Non-existent ID | 1. Visit broken link | Shows Page Not Found. | Low | Neg | PASS |
| TC-048 | Forms | Concurrent Edit | 2 admins | 1. Two people edit | System handles final version. | Medium | Data | PASS |
| TC-049 | Forms | Dashboard List | 10 forms | 1. View dashboard | All forms listed correctly. | Low | UI | PASS |
| TC-050 | Forms | Version Sync | Template update | 1. Deploy form | Correct schema version saved. | Medium | Data | PASS |
| TC-051 | Forms | Ownership Log | Form creation | 1. Check createdBy | Correct owner recorded. | Low | Data | PASS |
| TC-052 | Forms | Remove Form | Form exists | 1. Click delete | Form removed from system. | High | Func | PASS |
| TC-053 | Forms | Toggle System | Status switch | 1. Flip switch | Access changes immediately. | High | Func | PASS |
| TC-054 | Forms | Update Form Info | Edit mode | 1. Save changes | Form details update correctly. | Medium | Data | PASS |
| TC-055 | Submit | Data Validation | Empty field | 1. Try to submit | Required fields marked. | High | UX | PASS |
| TC-056 | Submit | Email Format | Bad email | 1. Enter bad email | Error message shown. | High | UX | PASS |
| TC-057 | Submit | Choice Logic | Radio buttons | 1. Select choice | Correct data saved. | Medium | Func | PASS |
| TC-058 | Submit | Submission OK | Form active | 1. Fill and submit | Success message shown. | Critical | Func | PASS |
| TC-059 | Submit | Blocked Mode | Form inactive | 1. Try to submit | Submission blocked. | High | Sec | PASS |
| TC-060 | Submit | Multi-Select | Checkboxes | 1. Select multiple | All items saved as list. | Medium | Data | PASS |
| TC-061 | Submit | Long Text Check | Paragraph | 1. Paste long text | Full data saved successfully. | Medium | Data | PASS |
| TC-062 | Submit | Success Page | Form finished | 1. View success | Clean redirect and message. | Low | UX | PASS |
| TC-063 | Submit | API Access | Direct POST | 1. Manual push | Response saved correctly. | Medium | Sys | PASS |
| TC-064 | Submit | Conflict Check | Same time submit | 1. Parallel submit | System saves both records. | Medium | Data | PASS |
| TC-065 | Resp | Dashboard Total | 10 responses | 1. Check stats | Number shown is correct. | High | Func | PASS |
| TC-066 | Resp | Data Table View | Many columns | 1. View results table | All data aligned correctly. | High | Perf | PASS |
| TC-067 | Resp | View Details | Click row | 1. Open view | Individual data displayed. | High | Func | PASS |
| TC-068 | Resp | Keyword Filter | Search box | 1. Search 'Survey' | Table filters result. | Medium | Func | PASS |
| TC-069 | Resp | Date Filter | Start/End date | 1. Set date range | Data outside range hidden. | Medium | Func | PASS |
| TC-070 | Resp | Edit Response | Admin edit | 1. Update data | Record updated correctly. | Medium | Func | PASS |
| TC-071 | Resp | Remove Record | Response list | 1. Click delete | Record removed successfully. | Medium | Func | PASS |
| TC-072 | Resp | Export Report | CSV download | 1. Click export | File downloaded correctly. | High | Func | PASS |
| TC-073 | Resp | Page Control | 100+ responses | 1. Use pages | Next page loads correctly. | Low | UI | PASS |
| TC-074 | Resp | Update Data | Live sync | 1. Hit refresh | New responses appear. | Medium | UI | PASS |
| TC-075 | Resp | Empty State | No responses | 1. Visit report | Zero data message shown. | Low | UI | PASS |
| TC-076 | Resp | Data Update Flow | Single record | 1. Edit/Save | Only target record changes. | Medium | Data | PASS |
| TC-077 | Resp | Auto Update | Live feed | 1. Enable refresh | Data updates automatically. | Medium | Auto | PASS |
| TC-078 | Resp | Missing Search | No results | 1. Search random | Shows No Match. | Low | UI | PASS |
| TC-079 | Resp | Header Check | Form fields | 1. View headers | Table matches form fields. | Medium | UI | PASS |
| TC-080 | Admin | User List | Admin view | 1. Load users | All staff visible. | High | Func | PASS |
| TC-081 | Admin | Disable Account | Staff user | 1. Click suspend | Access blocked correctly. | High | Sec | PASS |
| TC-082 | Admin | Activate Account | Suspended user | 1. Click activate | Access restored correctly. | High | Sec | PASS |
| TC-083 | Admin | List Design | View toggle | 1. Set grid/table | Layout changes smoothly. | Low | UI | PASS |
| TC-084 | Admin | Change Role | Manager level | 1. Update role | Permissions update correctly. | High | Func | PASS |
| TC-085 | Admin | Self Protection | Own account | 1. Try to delete self | Action blocked successfully. | High | Sec | PASS |
| TC-086 | Infra | Backend Test | Server link | 1. Check server | Running correctly. | Critical | Sys | PASS |
| TC-087 | Infra | Frontend Test | UI link | 1. Check UI | Displaying correctly. | Critical | Sys | PASS |
| TC-088 | Infra | Database Test | Connection | 1. Check DB | Link is healthy. | Critical | Sys | PASS |
| TC-089 | Docker | Cluster Start | Compose command | 1. Run all | 3 containers started. | High | Infra | PASS |
| TC-090 | Docker | Network Link | Shared data | 1. Connect services | Link is healthy. | High | Infra | PASS |
| TC-091 | Docker | Browser Access | Localhost link | 1. Visit UI | Page accessible on port. | High | Infra | PASS |
| TC-092 | Docker | Settings Secret | Secret passwords | 1. Read env files | System secured correctly. | Critical | Sec | PASS |
| TC-093 | Docker | File Store | Disk storage | 1. Reset system | Data remains saved. | Critical | Data | PASS |
| TC-094 | Docker | URL Handling | Single Page App | 1. Refresh page | Routing works correctly. | High | Infra | PASS |
| TC-095 | Docker | AI Integration | Gemini link | 1. Generate text | AI responds correctly. | High | AI | PASS |
| TC-096 | Docker | Build System | Modern code | 1. Build app | Zero errors reported. | High | Sys | PASS |
| TC-097 | Docker | Container Check | Health status | 1. Check stats | All marked as healthy. | Medium | Sys | PASS |
| TC-098 | Security | Email Delivery | SMTP settings | 1. Trigger email | Message received correctly. | High | Sys | PASS |
| TC-099 | Security | Database Update | V15 change | 1. Check tables | New security fields exist. | High | Data | PASS |
| TC-100 | Security | Time Zone Sync | Lockout date | 1. Lock account | Block expires correctly. | Medium | Qual | PASS |

---

🔗 **Consistency Check**: [001-100] Continuous | **Total Cases**: 100 | **Result**: ALL PASS
