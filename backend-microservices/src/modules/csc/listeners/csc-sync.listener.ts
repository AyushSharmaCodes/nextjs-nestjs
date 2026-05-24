// src/modules/csc/listeners/csc-sync.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvents } from '../../../common/events/event-names';
import { CscEventPayload } from '../../../common/events/event-payloads';
import { CscService } from '../csc.service';

@Injectable()
export class CscSyncListener {
  private readonly logger = new Logger(CscSyncListener.name);

  constructor(private readonly cscService: CscService) {}

  @OnEvent(DomainEvents.CSC.SYNC_TRIGGERED, { async: true })
  async handleCscSyncTriggered(payload: CscEventPayload) {
    const startTime = Date.now();
    this.logger.log(
      `Received CSC sync event [${DomainEvents.CSC.SYNC_TRIGGERED}] triggered by "${payload.triggeredBy}". Event timestamp: ${payload.timestamp}`
    );

    try {
      this.logger.log('Executing Country Sync process...');
      const result = await this.cscService.syncCountriesIfStale();
      const duration = Date.now() - startTime;

      if (result.synced) {
        this.logger.log(
          `Country Sync COMPLETED successfully. Reason: ${result.reason}, records: ${result.count}. Duration: ${duration}ms`
        );
      } else {
        this.logger.log(
          `Country Sync SKIPPED (data is already fresh). Database records: ${result.count}. Duration: ${duration}ms`
        );
      }
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Country Sync FAILED after ${duration}ms. Error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : ({} as { stack?: string }).stack
      );
    }
  }
}
