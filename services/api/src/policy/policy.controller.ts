import { Controller, Get, Post, Request, UseGuards, Res } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('me')
export class PolicyController {
  constructor(private svc: PolicyService) {}

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async export(@Request() req, @Res() res) {
    const data = await this.svc.exportMe(req.user.id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="export-${req.user.id}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  }

  @UseGuards(JwtAuthGuard)
  @Post('wipe')
  async wipe(@Request() req) {
    const out = await this.svc.wipeMe(req.user.id);
    return out;
  }
}
