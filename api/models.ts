//
// 数据模型
// 此文件，定义了数据的类型以便于类型重用
//

/**
 * 服务器列表数据模型（ServerAPI）
 */
export interface List {
    server_list: Status[]
    total_member: number
    total: number
    random_seed: null | number
}

export interface ListItem {
    id: number
    name: string
}

/**
 * 服务器详细信息获取数据模型（ServerAPI）
 */
export interface Server {
    id: number
    name: string
    ip: string | null
    type: 'JAVA' | 'BEDROCK'
    version: string
    desc: string
    link: string
    is_member: boolean
    is_hide: boolean
    auth_mode: 'OFFLINE' | 'OFFICIAL' | 'YGGDRASIL'
    tags: Array<string>
}

export interface Status extends Server {
    status: {
        players: {
            online: number
            max: number
        }
        delay: number
        version: string
        motd: {
            plain: string
            html: string
            minecraft: string
            ansi: string
        }
        icon: string | null
    } | null
    permission: 'owner' | 'admin' | 'guest'
    code?: number
    detail: string | undefined
    cover_url: string | null
}

/**
 * 向服务器所有者发送的服务器状态数据模型（ServerAPI）
 */
export interface StatusWithUser extends Status {
    ip: string
}

/**
 * 服务器状态获取数据模型（MineStatus API）
 */
export interface Fetch_Status {
    online: boolean
    players: {
        online: number
        max: number
    }
    delay: number
    version: string
    motd: {
        plain: string
        html: string
        minecraft: string
        ansi: string
    }
    icon: string | null
}

/**
 * hCaptcha_sitekey 数据模型
 */
export interface SiteKey {
    hcaptcha_sitekey: string
}

/**
 * 登录数据模型
 * 数据类型: 请求
 */
export interface LoginData {
    /**
     * 图像id
     */
    username_or_email: string
    password: string
    captcha_response: string
}

/**
 * 登录数据模型
 * 数据类型: 返回
 */
export interface Login {
    detail: string | undefined
    code?: number
    access_token: string
    token_type: string
}

/**
 * 注册数据模型
 */
export interface Register {
    request: {
        captcha_response: string
        password: string
        display_name: string
        token: string
    }
    avatar: File | undefined
}

/**
 * ReturnResponse
 */
export interface ReturnResponse {
    /**
     * 消息, 状态返回消息
     */
    detail: string
    code?: number
}

/**
 * ReturnResponse_Register
 */
export interface ReturnResponse_Register {
    code?: number
    /**
     * 消息，状态返回消息
     */
    detail: string
    /**
     * 用户ID，用户ID
     */
    user_id: number
}

/**
 * Request
 *
 * GetServerManagers
 */
export interface ServerManagers {
    /**
     * 服务器管理员，服务器的所有管理员
     */
    admins: UserBase[]
    /**
     * 服务器主人，服务器的所有主人
     */
    owners: UserBase[]
}

/**
 * UserBase
 */
export interface UserBase {
    /**
     * Avatar Url，用户的头像URL
     */
    avatar_url: null | string
    /**
     * Display Name，用户的显示名称
     */
    display_name: string
    /**
     * Id，用户的唯一标识符
     */
    id: number
    /**
     * Is Active，用户是否激活
     */
    is_active?: boolean
    /**
     * 用户角色
     */
    role?: RoleEnum
}

/**
 * 用户角色
 *
 * RoleEnum
 */
export enum RoleEnum {
    Admin = 'admin',
    User = 'user',
}

/**
 * 用户（ServerAPI）
 * (获取当前用户信息 鉴权)
 */
export interface UserMe extends UserBase {
    /**
     * Email，用户的电子邮箱
     */
    email: string
    /**
     * Username，用户的用户名
     */
    username: string
    created_at: string
    last_login: string
    last_login_ip: string
    servers: Array<Array<number | string>>
    code?: number
}

/**
 * 用户（ServerAPI）
 * (获取用户信息 公有)
 */
export interface User extends UserBase {
    /**
     * Username，用户的用户名
     */
    created_at: string
    last_login: string
    servers: Array<Array<number | string>>
    code?: number
}

/**
 * (获取画廊 公有)
 */
export interface Gallerys {
    id: number
    name: string
    gallerys_url: gallerys_url[]
    code?: number
}

/**
 * (获取画廊 公有)
 * 子数组
 */
export interface gallerys_url {
    /**
     * 图像id
     */
    id: number
    title: string
    description: string
    image_url: string
}

/**
 * (添加画廊图片 私有)
 */
export interface add_gallery {
    /**
     * 图像id
     */
    id: number
    title: string
    description: string
    image: File | null
    code?: number
}

/**
 * ServerTotalPlayers
 */
export interface ServerTotalPlayers {
    /**
     * 服务器总玩家数，服务器的总玩家数
     */
    total_players: number
}
