// Presentation-only translations. Never translate stored values, message content, or record names.
const pairs = {
'Campaign types':'캠페인 유형','Type / campaign':'유형 / 캠페인','Next step':'다음 단계','Status not recorded':'상태 미기록','The linked workspace is unavailable. Its connection will be kept.':'연결된 캠페인 그룹을 불러올 수 없습니다. 기존 연결은 유지됩니다.','Reload this campaign before adding a type.':'유형을 추가하려면 캠페인을 새로고침해 주세요.','Editing access to the main campaign is required.':'대표 캠페인에 대한 수정 권한이 필요합니다.',
'Campaign workspace':'캠페인 그룹','Campaign workspace · Optional':'캠페인 그룹 · 선택 사항','Campaign overview':'캠페인 개요','Add type':'유형 추가','Types':'유형','By type':'유형별','Separate campaign':'별도 캠페인','Agreement':'계약','Seeding status':'제품 제공 상태','Collaboration status':'협업 상태','Engagement not recorded':'협업 유형 미기록','Contract document missing':'계약서 없음','Contract document pending review':'계약서 검토 대기','Contract document approved':'계약서 검토 승인','Contract document rejected':'계약서 검토 반려','Shipment requested':'배송 요청됨','Type not recorded':'유형 미기록','Only loaded workspaces are listed. Existing links are kept.':'불러온 캠페인 그룹만 표시됩니다. 기존 연결은 유지됩니다.','This workspace contains other campaign types. Open an individual type to change its workspace.':'다른 유형이 연결된 캠페인 그룹입니다. 그룹을 변경하려면 해당 유형을 열어 주세요.','Workspace choices are unavailable. The current link will be kept. Reopen the editor to change it.':'캠페인 그룹 목록을 불러오지 못했습니다. 기존 연결은 유지됩니다. 변경하려면 편집창을 다시 열어 주세요.',
'Paused until activation is approved.':'활성화 승인 전까지 일시 중지됩니다.','Activation pending.':'활성화 승인 대기 중입니다.','Checks are off.':'확인이 꺼져 있습니다.','Review settings to resume checks.':'설정을 확인하고 다시 시작하세요.','Finish setup to start checks.':'설정을 완료하면 확인이 시작됩니다.','Review pending items to continue.':'대기 중인 항목을 검토해 주세요.','Select a campaign to manage its checks.':'확인 설정을 관리할 캠페인을 선택하세요.','Saving settings does not activate paused checks.':'설정을 저장해도 일시 중지된 확인은 시작되지 않습니다.',

'Unreviewed Replies':'미검토 답장','Creator Responses':'크리에이터 답장','Loading replies…':'답장 불러오는 중…','No unreviewed replies.':'미검토 답장이 없습니다.','Replies are unavailable. Reload the campaign to try again.':'답장을 불러오지 못했습니다. 캠페인을 새로고침해 주세요.','Show fewer replies':'답장 접기','Activity unknown':'진행 상태 미확인','Creator':'크리에이터','Manager phase':'담당자 진행 단계','Engagement':'협업 유형','Fee':'비용','Affiliate':'제휴','Other':'기타','Paid and product':'유료 및 제품 제공','Not yet agreed':'협의 전','to':'~','Next step:':'다음 단계:','Seeding':'제품 제공','Unpaid':'미지급','Campaigns':'캠페인','Creators':'크리에이터','Finances':'정산','Shipments':'배송','Settings':'설정','Profile':'프로필','Automations':'자동화',
'Campaign operations':'캠페인 관리','CAMPAIGN OPERATIONS':'캠페인 관리','Campaign directory':'캠페인 목록','Creator library':'크리에이터 목록','Creator responses':'크리에이터 답장','Unreviewed replies':'미검토 답장','Unread replies':'읽지 않은 답장','Unread':'읽지 않음','Reviewed':'검토 완료','Review':'검토','Review reply':'답장 검토','Pending review':'검토 대기',
'Campaign':'캠페인','Brand / product':'브랜드 / 제품','Type':'유형','Activity':'진행 상태','Dates':'기간','Budget':'예산','Manager':'담당자','Actions':'관리','Category':'카테고리','Brand':'브랜드','Product':'제품','Product name':'제품명','Campaign name':'캠페인 이름','Campaign type':'캠페인 유형','Status':'상태','Start date':'시작일','End date':'종료일','Timezone':'시간대','Funding':'비용 분담',
'Create campaign':'캠페인 만들기','Edit campaign':'캠페인 수정','Edit':'수정','Delete':'삭제','Save':'저장','Save changes':'변경사항 저장','Saving…':'저장 중…','Cancel':'취소','Close':'닫기','Clear':'선택 해제','Search':'검색','Search campaigns':'캠페인 검색','Search creators':'크리에이터 검색','Filters':'필터','Filter':'필터','Apply':'적용','Reset':'초기화','Refresh':'새로고침','Load more':'더 보기','Next':'다음','Previous':'이전','Back':'뒤로','Open campaign':'캠페인 열기','Open profile':'프로필 열기','All campaigns':'전체 캠페인','All creators':'전체 크리에이터','Select all':'전체 선택','Select campaign':'캠페인 선택','Add to a campaign':'캠페인에 추가','Add creators':'크리에이터 추가',
'Active':'진행 중','Inactive':'비활성','Planning':'준비 중','Completed':'완료','Paused':'일시 중지','Not recorded':'기록 없음','Not assigned':'미지정','Current manager':'현재 담당자','Manager choices are unavailable. Reload to try again.':'담당자 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.','Required':'필수','Optional':'선택','Overview':'개요','Details':'상세 정보','Content':'콘텐츠','Rates & deals':'캠페인 / 비용 기록','Campaigns worked with BYOU':'BYOU 캠페인 참여 이력','Campaign / fee record':'캠페인 / 비용 기록','Date':'날짜','Recorded amount':'기록된 금액','Payment status':'정산 상태','Post links / scope':'게시물 / 범위',
'Payments':'정산','Payment':'정산','Payment timing':'정산 일정','Full invoice amount':'청구 금액','Deliverable live date':'콘텐츠 게시일','Payment due · Net 30':'지급 예정일 · 게시 후 30일','Payment method':'지급 방법','Choose wire or check':'계좌 이체 또는 수표 선택','Invoice':'인보이스','Upload invoice PDF':'인보이스 PDF 업로드','Upload needed':'업로드 필요','Documents':'서류','W-9':'W-9','Due date':'지급 예정일','Amount':'금액','Recipient':'수령인','Address':'주소','Add address':'주소 추가','Address missing':'주소 미입력','Recipient name missing':'수령인 이름 미입력','Tracking':'배송 조회','Tracking number':'운송장 번호','Carrier':'배송사','Shipment':'배송','Ship date':'발송일',
'Automation':'자동화','Configure automation':'자동화 설정','Email reply checks':'이메일 답장 확인','Shipment checks':'배송 확인','Current state':'현재 상태','Linked mailbox':'연결된 메일함','Enrolled creators':'등록된 크리에이터','Saved setting':'저장된 설정',
'Conversation':'대화','Your reply':'답장 작성','Email message':'이메일 내용','Email subject':'이메일 제목','Replying to this message':'이 메시지에 답장 중','Replying to':'답장 대상','Received message':'받은 메시지','BYOU team':'BYOU 팀','Show quoted history':'이전 대화 보기','View conversation history':'대화 내역 보기','Open thread in Gmail ↗':'Gmail에서 대화 열기 ↗','Open draft in Gmail ↗':'Gmail에서 초안 열기 ↗','Send email':'이메일 보내기','Approve & send':'승인 후 보내기','Review before sending':'보내기 전 확인','Keep editing':'계속 수정','Start a new draft':'새 초안 작성','I reviewed this reply':'답장 내용을 확인했습니다','Loading conversation…':'대화 불러오는 중…','No messages loaded.':'불러온 메시지가 없습니다.','Draft':'초안','From':'보낸 사람','To':'받는 사람','Attach files':'파일 첨부','Insert image':'이미지 삽입','Templates':'템플릿','Template':'템플릿','Use a saved message':'저장된 메시지 사용','Bold':'굵게','Italic':'기울임','Underline':'밑줄','Font':'글꼴','Normal':'본문','Sans serif':'고딕','Serif':'명조',
'Compare themes':'테마 비교','Monochrome':'모노크롬','Botanical':'보태니컬','Sign out':'로그아웃','Main navigation':'주 메뉴','Mobile navigation':'모바일 메뉴','Profile and settings':'프로필 및 설정','Skip to main content':'본문으로 건너뛰기','Close conversation':'대화 닫기','Close editor':'편집창 닫기','Select creators':'크리에이터 선택'
};
Object.assign(pairs, {
 'Campaign details, creator progress, and the work that comes next.':'캠페인 정보와 크리에이터 진행 상황, 다음 할 일을 확인하세요.',
 'Browse creator profiles, platforms and recorded collaboration history.':'크리에이터 프로필, 활동 플랫폼, 협업 이력을 확인하세요.',
 'Creator payments by campaign. Spending reports total BYOU’s share of confirmed paid invoices.':'캠페인별 크리에이터 정산을 관리합니다. 지출 보고서에는 지급이 확인된 BYOU 부담액이 집계됩니다.',
 'Sample workspace · Changes stay in this preview. No messages, shipments, or payments are sent.':'샘플 공간 · 변경사항은 이 미리보기에만 저장됩니다. 실제 메시지 전송, 배송, 지급은 실행되지 않습니다.',
 'Sample workspace · Changes stay in this preview. No messages, shipments, or payments are sent. XLSX downloads are available in the connected workspace.':'샘플 공간 · 실제 메시지 전송, 배송, 지급은 실행되지 않습니다. 엑셀 다운로드는 연결된 업무 공간에서 사용할 수 있습니다.',

 'Skin Care':'스킨케어','Hair Care':'헤어 케어','Makeup':'메이크업','Body Care':'바디 케어','Fragrance':'향수','Wellness':'웰니스','Lifestyle':'라이프스타일','Choose a category':'카테고리 선택','Other category…':'기타 카테고리…','Custom category':'직접 입력','Enter your category':'카테고리를 입력하세요','Category · Optional':'카테고리 · 선택',
 'All types':'전체 유형','All brands':'전체 브랜드','Brands':'브랜드','All platforms':'전체 플랫폼','Platform':'플랫폼','Collaboration':'협업 이력','Both':'유료 및 제품 제공','Agency':'소속사','All agencies':'전체 소속사','Email Availability':'이메일 보유 여부','Has email':'이메일 있음','No email':'이메일 없음','Email available':'이메일 있음','No email saved':'저장된 이메일 없음','Email availability unknown':'이메일 보유 여부 확인 불가','Filter creators by email availability':'이메일 보유 여부로 크리에이터 필터링','Costco creators':'Costco 크리에이터','Campaign relationship':'캠페인 관계','Any recorded relationship':'전체 관계','Contacted':'연락 완료','Contacted only':'연락만 진행','Participated':'참여 기록 있음','Participated (delivery unverified)':'참여 기록 있음 (게시 미확인)','Delivered':'콘텐츠 제출 완료','History unconfirmed':'이력 미확인','Clear brand and campaign filters':'브랜드 및 캠페인 필터 해제',
 'Sort by':'정렬','Sort by date':'날짜순 정렬','Most complete':'정보가 많은 순','Followers: high to low':'팔로워 많은 순','Followers: low to high':'팔로워 적은 순','Campaigns worked: most first':'참여 캠페인 많은 순','Campaigns worked: fewest first':'참여 캠페인 적은 순','Recorded campaign agreement: high to low':'기록된 계약 금액 높은 순','Recorded campaign agreement: low to high':'기록된 계약 금액 낮은 순','Newest to oldest':'최신순','Oldest to newest':'오래된 순','Due date · soonest first':'지급 예정일 빠른 순','Creator name':'크리에이터 이름순','Gallery':'갤러리','Table':'표','Cards':'카드','List':'목록','Rows per page':'페이지당 항목 수','Choose table columns':'표 열 선택','Comparison columns':'비교 항목','Accounts':'계정','Latest fee record':'최근 비용 기록',
 'Your creator network':'크리에이터 네트워크','Creator profile':'크리에이터 프로필','Campaigns & fees':'캠페인 및 비용','Campaigns and fees':'캠페인 및 비용','Recorded campaign fees':'기록된 캠페인 비용','Fee record':'비용 기록','Social accounts':'소셜 계정','Posts made with BYOU':'BYOU 협업 게시물','Campaign history':'캠페인 이력','Campaign records':'캠페인 기록','Verified posts':'확인된 게시물','Supported fee packages':'근거가 있는 비용 패키지','Recorded payment items':'기록된 정산 항목','Imported profile details':'가져온 프로필 정보','Public portfolio':'공개 포트폴리오','Recent work':'최근 작업','← All creators':'← 전체 크리에이터','Open staff record':'관리 기록 열기','Play deliverable':'콘텐츠 재생','Open original post ↗':'원본 게시물 열기 ↗','Open profile ↗':'프로필 열기 ↗','Views':'조회수','Likes':'좋아요','Comments':'댓글','Sync BSM / Day One roster':'BSM / Day One 명단 동기화','Syncing agencies…':'소속사 동기화 중…','Export matching creators (.xlsx)':'검색 결과 내보내기 (.xlsx)','Preparing XLSX…':'엑셀 준비 중…',
 'No campaign participation recorded.':'기록된 캠페인 참여 이력이 없습니다.','No campaign fee entries recorded.':'기록된 캠페인 비용이 없습니다.','No verified posts recorded.':'확인된 게시물이 없습니다.','No campaign history recorded.':'기록된 캠페인 이력이 없습니다.','Category not recorded':'카테고리 미입력','Status not recorded':'상태 미입력','Handle not recorded':'계정명 미입력','Phase not assigned':'단계 미지정','Participation recorded':'참여 기록 있음',
 'Campaign details':'캠페인 정보','Start date · Optional':'시작일 · 선택','End date · Optional':'종료일 · 선택','Budget · Optional':'예산 · 선택','Closeout':'마무리 중','Cancelled':'취소됨','Archived':'보관됨','Unconfirmed':'미확인','Brand shares marketing costs 50/50?':'브랜드와 마케팅 비용을 절반씩 분담하나요?','No · BYOU pays 100%':'아니요 · BYOU 전액 부담','Yes · 50/50 with brand':'예 · 브랜드와 절반씩 부담','Challenge completed':'챌린지 완료','Templates · Optional at setup':'템플릿 · 초기 설정 시 선택','Campaign creators':'캠페인 크리에이터','Choose creators':'크리에이터 선택','Review messages':'메시지 검토','Prepare selected messages':'선택한 메시지 준비','Clear selection':'선택 해제','Preparing…':'준비 중…','Approve phase change':'단계 변경 승인','Move creator to':'크리에이터 단계 변경','Choose a phase':'단계 선택','Choose phase':'단계 선택','Reason (optional)':'사유 (선택)','Engagement type':'협업 유형','Recorded fee':'기록된 비용','Edit payment details':'정산 정보 수정',
 'Intake and Qualification':'접수 및 적합성 검토','Negotiation & Contract Signing':'협의 및 계약','Shipping & Sampling':'배송 및 제품 체험','Content Production & Revision':'콘텐츠 제작 및 수정','Payment Processing & Closeout':'정산 및 마무리',
 'Search finances':'정산 검색','Marketing Expense Calculator':'마케팅 비용 계산기','Confirm payment sent':'지급 완료 기록','Delay one week':'1주 연기','Creator / campaign':'크리에이터 / 캠페인','50/50 with brand':'브랜드와 절반씩 분담','Invoice / BYOU share':'청구 금액 / BYOU 부담액','Amount / BYOU share':'금액 / BYOU 부담액','Undo payment':'지급 완료 취소','Undo payment confirmation':'지급 완료 기록 취소','Payment date / timing':'지급일 / 일정','Deliverables':'제출 콘텐츠','Ad codes':'광고 코드','Method':'지급 방법','Wire':'계좌 이체','Check':'수표','Full invoice':'전체 청구 금액','BYOU share':'BYOU 부담액','Actual payment date':'실제 지급일','Payment reference':'지급 참조 정보','Payment reference · Optional':'지급 참조 정보 · 선택','View only':'조회만 가능','Invoice uploaded':'인보이스 업로드 완료','No invoice uploaded yet.':'등록된 인보이스가 없습니다.','Upload W-9 PDF':'W-9 PDF 업로드','No W-9 uploaded yet.':'등록된 W-9이 없습니다.','Invoices, contracts & W-9':'인보이스, 계약서 및 W-9',
 'Search shipments':'배송 검색','Recipient full name':'수령인 성명','Shipping address':'배송지 주소','Box Size':'상자 크기','Shipping Cost ($)':'배송비','Shipping cost':'배송비','Tracking Original':'원본 운송장 정보','Tracking #':'운송장 번호','Packing Date':'포장일','Shipment notes':'배송 메모','Back to details':'상세 정보로 돌아가기','Skip details':'상세 정보 건너뛰기','Continue to notes':'메모 작성으로 이동','Send to shipment anyway':'배송 목록에 추가','Send to shipment':'배송 목록에 추가','Send to finances':'정산 목록에 추가',
 'Requested checks':'확인 항목','Verified mailbox':'확인된 메일함','No mailbox selected':'선택된 메일함 없음','Saved mailbox unavailable — review its connection':'저장된 메일함을 사용할 수 없습니다. 연결을 확인하세요.','Load more creators':'크리에이터 더 보기','Loading creators…':'크리에이터 불러오는 중…','Retry':'다시 시도','Loading finance records…':'정산 기록 불러오는 중…','Loading shipments…':'배송 정보 불러오는 중…',
 'Search by creator name or handle…':'크리에이터 이름 또는 계정명 검색…','Name, brand, or product':'캠페인, 브랜드 또는 제품 검색','Creator, campaign, or brand':'크리에이터, 캠페인 또는 브랜드 검색','Creator, campaign, product, or brand':'크리에이터, 캠페인, 제품 또는 브랜드 검색','Subject':'제목','Open thread ↗':'대화 열기 ↗','Image included in email':'이메일에 첨부된 이미지','Confirm email':'이메일 확인','Email conversation':'이메일 대화','Select outreach recipients':'메시지 수신자 선택','Review exact outreach messages':'보낼 메시지 검토',
 'I reviewed this creator’s campaign context and approve this phase.':'크리에이터의 캠페인 상황을 확인했으며 단계 변경을 승인합니다.','I reviewed this exact recipient and message.':'이 수신자와 보낼 메시지를 확인했습니다.','I confirm the money was sent for this creator and campaign on the date above.':'해당 크리에이터와 캠페인의 비용을 위 날짜에 지급했음을 확인합니다.'
});

Object.assign(pairs, {
 'Creator addresses, package details, and shipment tracking.':'크리에이터 배송지, 포장 정보와 배송 현황을 관리하세요.',
 'Recipient / address':'수령인 / 주소','Product / brand':'제품 / 브랜드','Edit shipment':'배송 정보 수정','Creator shipment queue':'배송 대기 목록',
 'Choose a campaign':'캠페인 선택','Selected campaign automation':'선택한 캠페인의 자동화','Campaign automation':'캠페인 자동화',
 'Schedule':'일정','Last successful check':'최근 확인 완료','Next check':'다음 확인','Not scheduled':'예정 없음','Never':'기록 없음','On':'켜짐','Off':'꺼짐','Unavailable':'사용 불가',
 'No verified mailbox linked':'연결된 메일함 없음','No mailbox linked':'연결된 메일함 없음','No creators enrolled':'등록된 크리에이터 없음',
 'Preview theme':'미리보기 테마','Settings sections':'설정 메뉴','Not started':'시작 전','Due':'지급 예정','Overdue':'지급 기한 초과',
 'No campaign files linked yet.':'등록된 캠페인 파일이 없습니다.','Files & references':'파일 및 참고 자료','Email templates':'이메일 템플릿','Campaign knowledge':'캠페인 정보',
 'Campaign details':'캠페인 정보','Campaign creators':'캠페인 크리에이터','Executive overview':'진행 요약','All phases':'전체 단계','Roster display':'목록 보기 방식',
 'Select a campaign to see its checks, saved settings, and items requiring review.':'자동화 설정을 확인할 캠페인을 선택하세요.',
 'Remove attachment':'첨부파일 삭제','Remove image':'이미지 삭제','Align left':'왼쪽 정렬','Align center':'가운데 정렬','Align right':'오른쪽 정렬','Bulleted list':'글머리 기호','Numbered list':'번호 목록','Undo':'실행 취소','Redo':'다시 실행','Font size':'글자 크기','Text style':'텍스트 스타일','Formatting':'서식','Clear formatting':'서식 지우기'
});

Object.assign(pairs, {
 'Edit creator payment':'크리에이터 정산 수정','Edit creator details':'크리에이터 정보 수정','Edit shipment':'배송 정보 수정','Campaign record':'캠페인 기록','Contract':'계약서','Uploaded':'업로드 완료','File unavailable':'파일을 불러올 수 없음','No contract uploaded yet.':'등록된 계약서가 없습니다.','Upload contract PDF':'계약서 PDF 업로드','PDF · up to 5 MB':'PDF · 최대 5 MB','A file is saved, but it could not be loaded. Reopen this editor to try again.':'저장된 파일을 불러오지 못했습니다. 편집창을 다시 열어 주세요.',
 'Upload a new invoice PDF':'새 인보이스 PDF 업로드','Upload a new W-9 PDF':'새 W-9 PDF 업로드','Upload a new contract PDF':'새 계약서 PDF 업로드','Engagement type':'협업 유형','Recorded fee':'기록된 비용','Unconfirmed':'미확인','Needs review':'검토 필요','Missing':'없음','Approved':'승인 완료','Rejected':'반려','Payment not recorded':'지급 기록 없음'
});


Object.assign(pairs, {
 'Unpaid · Next week or later':'미지급 · 다음 주 이후','Unpaid · This week':'미지급 · 이번 주','No unpaid payments for this week.':'이번 주 미지급 내역이 없습니다.','No paid payments in this view.':'표시할 지급 완료 내역이 없습니다.','No payments scheduled for next week or later.':'다음 주 이후 지급 예정 내역이 없습니다.','No post linked':'연결된 게시물 없음','No ad codes recorded':'등록된 광고 코드 없음','Method not selected':'지급 방법 미선택','Yes':'예','No':'아니요','BYOU:':'BYOU 부담액:',
 'Local design preview · Fabricated sample creators, not the live roster.':'디자인 미리보기 · 실제 명단이 아닌 샘플 크리에이터입니다.',
 'Sync BSM / Day One roster':'BSM / Day One 명단 동기화','Export matching creators (.xlsx)':'검색 결과 엑셀 다운로드','Save current filters':'현재 필터 저장','Save view':'보기 저장','View name':'보기 이름','View full profile':'전체 프로필 보기','No recorded collaboration':'협업 기록 없음','Last BYOU campaign':'최근 BYOU 캠페인','No verified work':'확인된 참여 기록 없음','No posts recorded':'등록된 게시물 없음','followers':'팔로워','Creator view':'크리에이터 보기 방식','Creator pages':'크리에이터 페이지',
 'Recorded campaign fees':'기록된 캠페인 비용','Fee record':'비용 기록','No campaign fee entries recorded.':'기록된 캠페인 비용이 없습니다.','No campaign participation recorded.':'기록된 캠페인 참여 이력이 없습니다.'
});


Object.assign(pairs, {
 '← All campaigns':'← 전체 캠페인','Manage creators':'크리에이터 관리','Prepare outreach':'메시지 준비','View conversation':'대화 보기','Edit files & templates':'파일 및 템플릿 수정','Select for outreach':'메시지 수신자로 선택','Unassigned':'미지정','Filter by manager phase':'진행 단계 필터','Last correspondence:':'최근 연락:',
 'Monospace':'고정폭','Small':'작게','Large':'크게','Huge':'아주 크게','Email formatting':'이메일 서식','Bold (Ctrl+B)':'굵게 (Ctrl+B)','Italic (Ctrl+I)':'기울임 (Ctrl+I)','Underline (Ctrl+U)':'밑줄 (Ctrl+U)','Insert link':'링크 삽입','Remove formatting':'서식 지우기','Link address':'링크 주소','Apply link':'링크 적용','Up to 5 files · 5 MB total':'최대 5개 파일 · 총 5 MB',
 'Sample conversation · No real Gmail access or message sending.':'샘플 대화 · 실제 Gmail 연결이나 메시지 전송은 실행되지 않습니다.',
 'Suggested reply · English · Review and edit before saving.':'영문 답장 초안 · 검토하고 수정한 뒤 저장하세요.','Suggested reply · Korean · Review and edit before saving.':'한국어 답장 초안 · 검토하고 수정한 뒤 저장하세요.'
});


Object.assign(pairs, {
 'Add creators to a campaign':'캠페인에 크리에이터 추가','Editable campaigns':'추가할 캠페인','Select creators or drag a card onto a campaign.':'크리에이터를 선택하거나 카드를 캠페인으로 끌어다 놓으세요.','Drop or select':'끌어다 놓기 또는 선택','Clear selection':'선택 해제','More campaigns':'캠페인 더 보기','Campaign records':'캠페인 기록','Verified posts':'확인된 게시물','Supported fee packages':'확인된 비용 기록','Recorded payment items':'기록된 정산 항목','No verified posts recorded.':'확인된 게시물이 없습니다.','Creator profile sections':'크리에이터 프로필 메뉴'
});

Object.assign(pairs, {
 'Not confirmed':'미확인','Pacific time':'미국 태평양 시간','Weekdays, 8:30 am–6:00 pm · Every 30 minutes':'평일 오전 8:30–오후 6:00 · 30분마다','Daily at 9:00 am':'매일 오전 9:00','No verified mailbox or live checks are connected in the sample workspace.':'샘플 공간에는 확인된 메일함이나 실시간 확인이 연결되어 있지 않습니다.','Review and approve each email before sending.':'각 이메일을 검토하고 승인한 뒤 보내세요.'
});
Object.assign(pairs, {
  "Unpaid (next week or further out)":"미지급 · 다음 주 이후", "XLSX available in connected workspace":"연결된 업무 공간에서 엑셀을 다운로드할 수 있습니다.","View only":"조회만 가능","50/50 with brand":"브랜드와 절반씩 분담","XLSX downloads are available in the connected workspace.":"엑셀 다운로드는 연결된 업무 공간에서 사용할 수 있습니다.","Return this creator to Unpaid using their saved payment due date. This corrects the record; it does not reverse a bank transfer.":"저장된 지급 예정일을 유지한 채 미지급 상태로 되돌립니다. 기록만 수정되며 송금은 취소되지 않습니다.","Return to unpaid":"미지급으로 되돌리기","Creator addresses, package details, shipment tracking, and notes. Edit a cell directly; changes save as you move on.":"크리에이터 배송지, 포장 정보, 배송 현황과 메모를 관리하세요. 항목을 수정하고 다른 곳으로 이동하면 자동으로 저장됩니다.","Campaign / creator link":"캠페인 / 크리에이터 링크","Seeding / paid":"제품 제공 / 유료","Seeding or paid":"제품 제공 또는 유료","PIC":"배송 담당자","Notes":"메모","Shipment notes":"배송 메모","Recipient name":"수령인 이름","Shipping address":"배송지 주소","Date shared to shipments":"배송 목록에 추가된 날짜","Select this page":"이 페이지 선택","Select creator":"크리에이터 선택","Sort creators":"크리에이터 정렬","Filter by platform":"플랫폼별 필터","Filter creators by collaboration history":"협업 이력별 필터","Filter creators by agency":"소속사별 필터","Brand and campaign filters":"브랜드 및 캠페인 필터","Last correspondence date unavailable":"최근 연락 날짜 확인 불가","Intake":"접수", "Negotiation":"협의", "Shipping":"배송", "Brand kit":"브랜드 자료", "Product deck":"제품 소개 자료", "Reference":"참고 자료", "Saved":"저장됨", "Not added":"미등록", "Summary": "요약",
  "Next step": "다음 조치",
  "Review later": "나중에 검토",
  "Previous reply": "이전 답장",
  "Revisit handled cards": "넘긴 답장 다시 보기",
  "Load more replies": "답장 더 불러오기",
  "Conversation unavailable": "대화를 불러올 수 없음",
  "Creator name unavailable": "크리에이터 이름 확인 불가",
  "Their latest reply needs review.": "최근 답장을 검토해 주세요.",
  "Review the latest conversation before deciding what to do next.": "최근 대화를 확인한 뒤 다음 조치를 결정하세요.",
  "No unreviewed replies shown on this page. Load more replies to continue.": "이 페이지에는 미검토 답장이 없습니다. 답장을 더 불러와 주세요.",
  "Progress overview": "진행 상황",
  "Close progress overview": "진행 상황 닫기",
  "Progress context is unavailable.": "진행 상황을 불러올 수 없습니다.",
  "A creator reply is awaiting manager review.": "크리에이터 답장이 담당자 검토를 기다리고 있습니다.",
  "Reload the campaign to check saved correspondence.": "캠페인을 새로고침해 저장된 대화를 확인하세요.",
  "Review the latest creator reply before updating progress.": "진행 상황을 변경하기 전에 크리에이터의 최근 답장을 검토하세요.",
  "Open the linked conversation to confirm the next step.": "연결된 대화에서 다음 조치를 확인하세요.",
  "Review the campaign assignment to record the next step.": "캠페인 배정 내용을 확인하고 다음 조치를 기록하세요.",
  "A verified campaign conversation is linked. No specific progress update has been recorded yet.": "확인된 캠페인 대화가 연결되어 있으나 구체적인 진행 상황은 아직 기록되지 않았습니다.",
  "No verified progress update is recorded yet.": "확인된 진행 상황 기록이 없습니다.",
  "Email context is unavailable. The saved manager note is shown when present.": "이메일 내역을 불러올 수 없습니다. 저장된 담당자 메모가 있으면 표시합니다.",
  "Live email checks are off. This overview uses saved correspondence.": "실시간 이메일 확인이 꺼져 있어 저장된 대화를 기준으로 표시합니다.",
  "Recent email coverage is unconfirmed.": "최근 이메일 확인 여부는 미확인 상태입니다.",
  "Paid campaigns": "유료 캠페인",
  "Seeding campaigns": "제품 제공 캠페인",
  "Campaigns unavailable": "캠페인을 불러올 수 없음",
  "Retry campaign list": "캠페인 목록 다시 불러오기",
  "Loading campaign…": "캠페인 불러오는 중…",
  "Loading campaign operations…": "캠페인 진행 상황 불러오는 중…",
  "Loading campaign automation…": "캠페인 자동화 불러오는 중…",
  "Automation unavailable": "자동화를 불러올 수 없음",
  "The saved settings could not be loaded. Retry this campaign.": "저장된 설정을 불러오지 못했습니다. 이 캠페인을 다시 불러와 주세요.",
  "Retry automation": "자동화 다시 불러오기",
  "More creators or replies may be available. Open the campaign to view the remaining items.": "더 많은 크리에이터나 답장이 있을 수 있습니다. 캠페인을 열어 확인하세요.",
  "Calendar": "일정",
  "Month": "월간",
  "Agenda": "일정 목록",
  "Dates to set": "날짜 설정 필요",
  "Unscheduled work": "날짜 미정 업무",
  "Previous month": "이전 달",
  "Next month": "다음 달",
  "Today": "오늘",
  "No events scheduled for this period.": "이 기간에 예정된 일정이 없습니다.",
  "No unscheduled work is recorded.": "날짜 미정 업무가 없습니다.",
  "Open campaign to set date": "캠페인에서 날짜 설정",
  "Campaign calendar": "캠페인 일정",
  "Creator progress": "크리에이터 진행 상황",
  "Campaign information": "캠페인 정보",
  "Edit amount": "금액 수정",
  "Expected invoice amount": "예상 청구 금액",
  "Confirm received amount": "수령 금액 확인",
  "Record payment": "지급 내역 기록",
  "View payment": "지급 내역 보기",
  "Undo payment record": "지급 기록 취소",
  "Spending report": "지출 보고서",
  "Download XLSX": "엑셀 다운로드",
  "No shipments match this view.": "조건에 맞는 배송 내역이 없습니다.",
  "Tracking unavailable": "배송 조회 불가",
  "Shipment details": "배송 정보",
  "Packing date": "포장일",
  "Box size": "상자 크기",
  "Shipping cost": "배송비",
  "ZIP code": "우편번호",
  "Country": "국가",
  "State": "주 / 도",
  "City": "시 / 군 / 구"
});

Object.assign(pairs,{'Full invoice:':'청구 금액:','BYOU share:':'BYOU 부담액:','Method:':'지급 방법:','Undo this payment confirmation.':'이 지급 확인 기록을 취소합니다.'});
Object.assign(pairs,{"Date of post":"게시일","Payment due date":"지급 예정일","Deliverable":"콘텐츠","Progress overview":"진행 현황","Close progress overview":"진행 현황 닫기","Manager phase not assigned":"담당자 진행 단계 미지정","Phase":"단계","Current":"현재 단계","Upcoming":"다음 단계","Record this only after the money has actually been sent. This action does not transfer money.":"실제로 비용을 지급한 후에만 기록하세요. 이 작업은 송금을 실행하지 않습니다.","Upload your creator list, then review any missing information.":"크리에이터 목록을 업로드하고 누락된 정보를 확인하세요.","Reading and saving creators…":"크리에이터를 불러와 저장하는 중…","Drop an XLSX or TXT file here":"XLSX 또는 TXT 파일을 여기에 놓으세요","or choose a file · up to 500 creators / 5 MB":"파일 선택 · 최대 500명 / 5 MB","Choose file":"파일 선택","No file chosen":"선택한 파일 없음","Upload creators XLSX or TXT":"크리에이터 XLSX 또는 TXT 업로드","Close Add creators":"크리에이터 추가 닫기","Use names, profile links, emails, locations and categories. TXT supports one creator per line; use":"이름, 프로필 링크, 이메일, 지역, 카테고리를 입력하세요. TXT는 한 줄에 한 명씩 입력하며,","or":"또는",". Missing fields stay on the checklist below.":" 형식을 사용하세요. 누락된 정보는 아래 확인 목록에 남습니다.","Needs info":"정보 보완 필요","Refresh status":"상태 새로고침","Keep these profiles moving: add the missing details or paste a relevant email thread. Saving a file does not mark a profile complete.":"누락된 정보나 관련 이메일 대화를 추가하세요. 파일을 저장해도 프로필 작성이 완료되는 것은 아닙니다.","Contact email":"연락 이메일","Content category":"콘텐츠 카테고리","Post thumbnails":"게시물 미리보기 이미지","Social profile":"소셜 프로필","Profile photo":"프로필 사진","Follower count":"팔로워 수","Some information could not be retrieved. Supply missing information or retry enrichment.":"일부 정보를 불러오지 못했습니다. 누락된 정보를 입력하거나 다시 조회하세요.","Add missing info / email thread":"정보 / 이메일 대화 추가","View creator card":"크리에이터 카드 보기","Retry Socialcrawl":"Socialcrawl 다시 조회","Profile populated":"프로필 정보 입력 완료","Populating data…":"정보 입력 중…","Queued for Socialcrawl":"Socialcrawl 조회 대기","Fetching profile and posts":"프로필과 게시물 조회 중","Needs identity information":"크리에이터 식별 정보 필요","Enrichment needs attention":"정보 조회 결과 확인 필요","Creator needs identification":"크리에이터 식별 필요","Creators are saved, but Socialcrawl is not connected to this server. Connect it to populate photos, follower counts and thumbnails.":"크리에이터는 저장되었으나 Socialcrawl이 연결되지 않아 사진, 팔로워 수, 미리보기 이미지를 불러올 수 없습니다.","Socialcrawl is populating creator cards. Saved progress survives a page refresh.":"Socialcrawl에서 크리에이터 정보를 조회하고 있습니다. 저장된 진행 상황은 새로고침해도 유지됩니다.","Correct existing account in staff records":"담당자 기록의 기존 계정 수정","Paste a relevant email thread or enter the missing details":"관련 이메일 대화 또는 누락 정보 입력","Or attach the relevant email excerpt (.txt)":"관련 이메일 발췌문 첨부 (.txt)","Only explicit details are filled. If the thread mentions several contacts or creators, specify which one belongs here.":"명시된 정보만 입력됩니다. 대화에 여러 연락처나 크리에이터가 있으면 해당하는 사람을 지정하세요.","Save evidence and populate":"근거 저장 후 정보 입력","Your imported creators and their missing information will appear here.":"가져온 크리에이터와 누락된 정보가 여기에 표시됩니다.","Previous imports":"이전 가져오기 내역","More imports":"가져오기 내역 더 보기","Imported creator pages":"가져온 크리에이터 페이지","Choose an XLSX or TXT file up to 5 MB.":"5 MB 이하의 XLSX 또는 TXT 파일을 선택하세요.","Use a TXT email excerpt up to 12 KB.":"12 KB 이하의 TXT 이메일 발췌문을 사용하세요.","Paste the Instagram or TikTok profile URL, or specify the platform and @handle.":"Instagram 또는 TikTok 프로필 링크나 플랫폼과 @계정명을 입력하세요.","Enter their name, or paste an email introduction.":"이름 또는 이메일의 소개 내용을 입력하세요.","Paste the relevant email thread or enter Email: followed by their contact address.":"관련 이메일 대화를 붙여 넣거나 Email: 뒤에 연락 이메일을 입력하세요.","Add their city, or paste the part of an email that states their location.":"도시 또는 지역이 명시된 이메일 내용을 입력하세요.","Add Category: followed by their content niche.":"Category: 뒤에 콘텐츠 분야를 입력하세요.","Run Socialcrawl after adding the correct profile, or upload a photo on the creator profile.":"정확한 프로필을 입력한 뒤 Socialcrawl로 조회하거나 프로필에 사진을 업로드하세요.","Run Socialcrawl to retrieve the missing account statistics.":"Socialcrawl로 누락된 계정 통계를 조회하세요.","Run Socialcrawl to load recent public posts. Private or empty accounts may need a different profile.":"Socialcrawl로 최근 공개 게시물을 조회하세요. 비공개 계정이거나 게시물이 없으면 다른 프로필이 필요할 수 있습니다."});
Object.assign(pairs,{"Original manager note":"담당자 메모 원문","Original next action":"다음 조치 원문","Reload the campaign to check saved correspondence.":"캠페인을 새로고침해 저장된 대화 내역을 확인하세요.","Review the latest creator reply before updating progress.":"진행 상황을 변경하기 전에 크리에이터의 최근 답장을 검토하세요.","Open the linked conversation to confirm the next step.":"연결된 대화에서 다음 조치를 확인하세요.","Review the campaign assignment to record the next step.":"캠페인 배정 내용을 검토하고 다음 조치를 기록하세요.","Progress context is unavailable.":"진행 상황 정보를 불러올 수 없습니다.","A verified campaign conversation is linked. No specific progress update has been recorded yet.":"확인된 캠페인 대화가 연결되어 있으나 구체적인 진행 상황은 아직 기록되지 않았습니다.","No verified progress update is recorded yet.":"확인된 진행 상황이 아직 기록되지 않았습니다."});
Object.assign(pairs,{"Location":"지역","Evidence saved. Supported fields are populated; unresolved fields remain listed.":"근거를 저장하고 확인된 정보를 입력했습니다. 미확인 항목은 목록에 남습니다.","Name: Anna Smith\nEmail: anna@example.com\nInstagram: @anna\nLocation: Los Angeles\nCategory: Beauty":"이름: 홍길동\n이메일: creator@example.com\nInstagram: @sample_creator\n지역: 서울\n카테고리: 뷰티","Paste the relevant email thread or enter Email: followed by their contact address.":"관련 이메일 대화를 붙여 넣거나 이메일: 뒤에 연락 이메일을 입력하세요.","Add Category: followed by their content niche.":"카테고리: 뒤에 콘텐츠 분야를 입력하세요."});
Object.assign(pairs,{'Use Send to finances on a campaign creator to add a payment for review.':'캠페인의 크리에이터 카드에서 정산으로 보내기를 선택하면 검토할 지급 내역이 추가됩니다.'});
const caseInsensitivePairs = new Map(Object.entries(pairs).map(([key,value])=>[key.toLocaleLowerCase('en'),value]));

const enumSelects = ['type','status','phase','fundingMode','method','categoryChoice','engagementType','activeTemplate','templateKey','collaboration','platform','stage','sort'].map(name=>`select[name="${name}"] option`).concat(['directory-type','directory-activity','shipment-sort','inline-phase','finance-sort'].map(field=>`select[data-ops-field="${field}"] option`)).concat(['select[data-shipment-key=shipmentType] option','select[name=campaign] option[value=""]']).join(',');
export function interfaceText(value, locale) { if(locale!=='ko')return value; const raw=String(value),trimmed=raw.trim(); let translated=pairs[trimmed] || caseInsensitivePairs.get(trimmed.toLocaleLowerCase('en')); if(!translated){const m=trimmed.match(/^(\d+) (selected|pending|unread replies|unreviewed replies|creators|messages?)$/i);if(m)translated={selected:`${m[1]}명 선택됨`,pending:`${m[1]}개 검토 대기`,'unread replies':`읽지 않은 답장 ${m[1]}개`,'unreviewed replies':`미검토 답장 ${m[1]}개`,creators:`크리에이터 ${m[1]}명`,message:`메시지 ${m[1]}개`,messages:`메시지 ${m[1]}개`}[m[2].toLowerCase()];}if(!translated){const m=trimmed.match(/^(\d+) shown · (\d+) loaded$/);if(m)translated=`${m[1]}개 표시 · ${m[2]}개 불러옴`;const more=trimmed.match(/^Show (\d+) more replies$/);if(more)translated=`답장 ${more[1]}개 더 보기`;}if(!translated){const phase=trimmed.match(/^(?:Phase )?(\d)[. ·]+(.+)$/);if(phase&&pairs[phase[2]])translated=`${phase[1]}단계 · ${pairs[phase[2]]}`;const selected=trimmed.match(/^(Select this page|Select all shown) \((\d+)\)$/);if(selected)translated=`${selected[1]==='Select this page'?'이 페이지 선택':'표시된 항목 전체 선택'} (${selected[2]})`;const history=trimmed.match(/^(\d+) earlier messages?$/);if(history)translated=`이전 메시지 ${history[1]}개`;}if(!translated){
 const reviews=trimmed.match(/^(\d+) (shown|to review)$/);if(reviews)translated=reviews[2]==='shown'?`답장 ${reviews[1]}개 표시`:`검토할 답장 ${reviews[1]}개`;
 const payBy=trimmed.match(/^Unpaid \(PAY BY (.+)\)$/);if(payBy)translated=`미지급 · ${payBy[1]}까지 지급`;
 const paidOn=trimmed.match(/^Paid on (.+)$/);if(paidOn)translated=`지급일 ${paidOn[1]}`;
 const delay=trimmed.match(/^Payment delayed by (\d+) weeks?$/);if(delay)translated=`지급 ${delay[1]}주 연기`;
 const ago=trimmed.match(/^(\d+) days? ago$/);if(ago)translated=`${ago[1]}일 전`;
 const template=trimmed.match(/^(Paid|Seeding): (Saved|Not added)$/);if(template)translated=`${template[1]==='Paid'?'유료':'제품 제공'}: ${template[2]==='Saved'?'저장됨':'미등록'}`;
 const fee=trimmed.match(/^(Paid|Seeding|Paid and product|Other)( · [\d,.]+)?$/);if(fee)translated=(fee[1]==='Paid'?'유료':pairs[fee[1]])+(fee[2]||'');
 const creatorLabel=trimmed.match(/^(Show progress for|Manager phase for|Actions for) (.+)$/);if(creatorLabel)translated=`${creatorLabel[2]} ${{'Show progress for':'진행 상황 보기','Manager phase for':'담당자 진행 단계','Actions for':'관리'}[creatorLabel[1]]}`;
 const selectCreator=trimmed.match(/^Select (.+)$/);if(selectCreator&&!translated)translated=`${selectCreator[1]} 선택`;
 const outreachLabel=trimmed.match(/^Select (.+) for outreach$/);if(outreachLabel)translated=`${outreachLabel[1]} 메시지 수신자로 선택`;
 const conversation=trimmed.match(/^Conversation from (.+)$/);if(conversation)translated=`${conversation[1]==='creator'?'크리에이터':conversation[1]}의 대화`;
 const finance=trimmed.match(/^(\d+) payments? · (\d+) campaigns?(?: · Thursday (\d{4}-\d{2}-\d{2}) · Includes overdue(?: · (\d+) (?:needs|need) a date)?)?$/);
 if(finance)translated=`${finance[1]}건 · 캠페인 ${finance[2]}개${finance[3]?` · 목요일 ${finance[3]} · 기한 초과 포함`:''}${finance[4]?` · 지급일 미정 ${finance[4]}건`:''}`;
 const docs=trimmed.match(/^(W-9|Invoice|Contract): (Upload needed|Uploaded)$/);if(docs)translated=`${pairs[docs[1]]||docs[1]}: ${pairs[docs[2]]}`;
 const dateLabel=trimmed.match(/^(Thursday|Live): (.*)$/);if(dateLabel)translated=`${dateLabel[1]==='Thursday'?'목요일 지급':'게시일'}: ${pairs[dateLabel[2]]||dateLabel[2]}`;
 const result=trimmed.match(/^([\d,]+) (Costco creators|creators) · (\d+) selected on loaded pages$/);if(result)translated=`${result[2]==='Costco creators'?'Costco 크리에이터':'크리에이터'} ${result[1]}명 · 불러온 목록에서 ${result[3]}명 선택`;
 const messageCount=trimmed.match(/^(\d+) messages? · Oldest to newest$/);if(messageCount)translated=`메시지 ${messageCount[1]}개 · 오래된 순`;
 const shown=trimmed.match(/^(\d+) creators? shown$/);if(shown)translated=`크리에이터 ${shown[1]}명 표시`;
 const phaseOnly=trimmed.match(/^Phase (\d)$/);if(phaseOnly)translated=`${phaseOnly[1]}단계`;
 const creator=trimmed.match(/^(\d+) creator$/);if(creator)translated=`크리에이터 ${creator[1]}명`;
 const page=trimmed.match(/^(\d+)–(\d+) of ([\d,]+)$/);if(page)translated=`전체 ${page[3]}명 중 ${page[1]}–${page[2]}명`;
 const edit=trimmed.match(/^(Edit|View) payment for (.+)$/);if(edit)translated=`${edit[2]} 정산 ${edit[1]==='Edit'?'수정':'보기'}`;
}
if(!translated){
 const phase=trimmed.match(/^Manager phase (\d): (.+)$/);if(phase)translated=`담당자 진행 ${phase[1]}단계: ${interfaceText(phase[2],'ko')}`;
 const description=trimmed.match(/^Phase (\d) is current\. Checkmarks indicate earlier phases; numbered pale segments indicate upcoming phases\. This is a manager-assigned phase, not a score or percentage\.$/);if(description)translated=`현재 ${description[1]}단계입니다. 체크 표시는 이전 단계, 숫자가 있는 연한 영역은 이후 단계입니다. 담당자가 지정한 진행 단계이며 점수나 비율이 아닙니다.`;
 if(trimmed==='No manager phase has been assigned. No phases are marked complete.')translated='담당자 진행 단계가 지정되지 않았으며 완료로 표시된 단계도 없습니다.';
 const count=trimmed.match(/^(\d+) (imported|on this page)$/);if(count)translated=count[2]==='imported'?`${count[1]}명 가져옴`:`이 페이지 ${count[1]}명`;
 const gaps=trimmed.match(/^Needs info · (\d+) fields$/);if(gaps)translated=`정보 보완 필요 · ${gaps[1]}개 항목`;
 const followers=trimmed.match(/^([\d,.]+) followers$/);if(followers)translated=`팔로워 ${followers[1]}명`;
 const account=trimmed.match(/^(Instagram|TikTok|YouTube|Facebook|instagram|tiktok) · ([\d,.]+) followers$/);if(account)translated=`${account[1]} · 팔로워 ${account[2]}명`;
 const platformDeliverable=trimmed.match(/^(Instagram|TikTok) · Deliverable (\d+)$/);if(platformDeliverable)translated=`${platformDeliverable[1]} · 콘텐츠 ${platformDeliverable[2]}`;
 const copyCode=trimmed.match(/^Copy (Instagram|TikTok) ad code, deliverable (\d+), (.+)$/);if(copyCode)translated=`${copyCode[3]} · ${copyCode[1]} 콘텐츠 ${copyCode[2]} 광고 코드 복사`;
 const deliverable=trimmed.match(/^Deliverable (\d+)$/);if(deliverable)translated=`콘텐츠 ${deliverable[1]}`;
 const thumbnail=trimmed.match(/^((?:instagram|tiktok): @[^:]+: )thumbnail could not be saved$/);if(thumbnail)translated=`${thumbnail[1]}미리보기 이미지를 저장하지 못했습니다.`;
 const populated=trimmed.match(/^Populated (\d+) creators? in this run\. Missing fields stay on the checklist\.$/);if(populated)translated=`이번 실행에서 ${populated[1]}명의 정보를 입력했습니다. 누락된 항목은 확인 목록에 남습니다.`;
 const saved=trimmed.match(/^(\d+) creator rows saved\. Cards are ready; missing information remains on the checklist\.$/);if(saved)translated=`크리에이터 ${saved[1]}명을 저장했습니다. 카드는 준비되었으며 누락된 정보는 확인 목록에 남습니다.`;
}return translated?raw.replace(trimmed,translated):raw; }
const exclude='.cl-brand-options,.ops-automation-enrollment,[data-no-translate],textarea,script,style,[contenteditable],.ops-name-link,[data-creator-card] h3,.ops-conversation-body,.ops-conversation-sender strong,.ops-conversation-reply-context strong,.ops-conversation .drawer-header p,.ops-conversation #conversation-title,.email-composer-content';
// Translate only fixed interface surfaces. Plain table cells and names are deliberately excluded.
const eligible='.cl-compact-followers,.cl-portfolio-facts strong,.cl-portfolio-facts small,.cl-portfolio-videos--empty,caption,.ops-card-summary>span,.ops-resources small,.ops-review-label,.ops-review-card header small,.ops-review-card footer small,.ops-review-queue-tools,.ops-progress-summary h3,.ops-progress-summary [data-i18n],.ops-editor h2,.cal-weekday,.cal-muted,.cal-agenda h2,.cal-agenda-row>time,.cal-agenda-row>span small,.cal-unscheduled h2,.cal-unscheduled nav,.settings-profile h2,[data-i18n],.nav-item,.mobile-nav button,.primary-nav button,.skip-link,thead th,button:not(.ops-name-link):not([data-ops-drop]):not([data-action="open-creator"]):not([data-action="open-campaign"]),label>span,legend,.ops-heading,.ops-status,.ops-note-static,.ops-conversation-direction,.ops-conversation-marker,.ops-conversation-tools,.ops-conversation-position,.ops-conversation-quote summary,.ops-conversation-draft label,.ops-conversation-draft h3,.theme-preview,.ops-attention .ops-section-heading,.ops-attention>p,.ops-count,.cl-header>div>p,.cl-header h1,.ops-header h1,.ops-header>div>p';
export function installInterfaceLanguage(root,getLocale){
 const original=new WeakMap(),attributes=new WeakMap();let queued=false;
 function apply(){queued=false;observer.disconnect();const locale=getLocale();document.documentElement.lang=locale;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){const parent=node.parentElement;if(!parent||parent.closest(exclude))continue;const fixedOption=parent.matches(enumSelects);if(parent.tagName==='OPTION'&&!fixedOption&&!parent.closest('[data-i18n]'))continue;if(!fixedOption&&parent.tagName!=='LABEL'&&!parent.closest(eligible))continue;const prior=original.get(node);const before=prior&&prior.last===node.nodeValue?prior.source:node.nodeValue;const context=parent.closest('[data-i18n-context]')?.dataset.i18nContext || (fixedOption&&parent.closest('select')?.matches('[name=type],[name=engagementType],[name=activeTemplate],[name=templateKey],[name=collaboration],[data-ops-field=directory-type],[data-shipment-key=shipmentType]')?'campaign-type':null);const after=locale==='ko'&&before.trim().toLowerCase()==='paid'&&context?before.replace(before.trim(),context==='payment-status'?'지급 완료':'유료'):interfaceText(before,locale);original.set(node,{source:before,last:after});if(node.nodeValue!==after)node.nodeValue=after;}
 for(const el of root.querySelectorAll('[aria-label],[title],[placeholder]')){if(el.closest('[data-no-translate]')||(el.closest(exclude)&&!el.matches('textarea,input,[contenteditable]')))continue;const saved=attributes.get(el)||{};for(const key of ['aria-label','title','placeholder']){if(!el.hasAttribute(key)){delete saved[key];continue;}const current=el.getAttribute(key),prior=saved[key],source=prior&&prior.last===current?prior.source:current;const next=interfaceText(source,locale);saved[key]={source,last:next};if(current!==next)el.setAttribute(key,next);}attributes.set(el,saved);}
 observer.observe(root,{childList:true,subtree:true,characterData:true});}
 const observer=new MutationObserver(changes=>{if(changes.every(change=>{const target=change.target.nodeType===Node.ELEMENT_NODE?change.target:change.target.parentElement;return target?.closest(exclude);}))return;if(!queued){queued=true;queueMicrotask(apply);}});apply();return {apply,disconnect:()=>observer.disconnect()};
}
